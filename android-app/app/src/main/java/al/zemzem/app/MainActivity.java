package al.zemzem.app;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.DownloadManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.view.Gravity;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import android.widget.ImageView;
import android.widget.EditText;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;

import androidx.core.content.FileProvider;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.LinkedHashSet;
import java.util.Set;

public class MainActivity extends Activity {
    private static final String HOME_URL = "https://www.zemzem.al/";
    private static final String CHANNEL_ID = "zemzem_updates";
    private static final int FILE_CHOOSER_REQUEST = 1001;
    private static final int NOTIFICATION_PERMISSION_REQUEST = 1002;
    private static final String PREFS = "zemzem_app";
    private static final String PREF_FAVORITES = "favorites";
    private static final String PREF_HISTORY = "history";
    private static final String PREF_DOWNLOADS = "downloads";

    private WebView webView;
    private SwipeRefreshLayout swipeRefresh;
    private ProgressBar progressBar;
    private LinearLayout errorView;
    private LinearLayout splashView;
    private LinearLayout bottomNav;
    private ValueCallback<Uri[]> filePathCallback;
    private Uri cameraImageUri;

    @SuppressLint({"SetJavaScriptEnabled", "JavascriptInterface"})
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        createNotificationChannel();
        requestNotificationPermissionIfNeeded();

        FrameLayout root = new FrameLayout(this);

        swipeRefresh = new SwipeRefreshLayout(this);
        webView = new WebView(this);
        swipeRefresh.addView(webView, new SwipeRefreshLayout.LayoutParams(
                SwipeRefreshLayout.LayoutParams.MATCH_PARENT,
                SwipeRefreshLayout.LayoutParams.MATCH_PARENT
        ));
        swipeRefresh.setOnRefreshListener(() -> webView.reload());
        swipeRefresh.setOnChildScrollUpCallback((parent, child) -> webView.getScrollY() > 0);

        FrameLayout.LayoutParams webParams = new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
        );
        int bottomNavHeight = (int) (62 * getResources().getDisplayMetrics().density);
        webParams.bottomMargin = bottomNavHeight;
        root.addView(swipeRefresh, webParams);

        progressBar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progressBar.setMax(100);
        progressBar.setVisibility(View.GONE);
        FrameLayout.LayoutParams progressParams = new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                6
        );
        root.addView(progressBar, progressParams);

        errorView = buildOfflineView();
        root.addView(errorView, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
        ));

        splashView = buildSplashView();
        root.addView(splashView, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
        ));

        bottomNav = buildBottomNavigation();
        FrameLayout.LayoutParams navParams = new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                bottomNavHeight
        );
        navParams.gravity = Gravity.BOTTOM;
        root.addView(bottomNav, navParams);

        setContentView(root);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setSupportMultipleWindows(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setUserAgentString(settings.getUserAgentString() + " ZemZemAndroid/1.2.0");

        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        cookieManager.setAcceptThirdPartyCookies(webView, true);

        webView.addJavascriptInterface(new AppBridge(), "ZemZemAndroid");

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                progressBar.setProgress(newProgress);
                progressBar.setVisibility(newProgress >= 100 ? View.GONE : View.VISIBLE);
                if (newProgress >= 100) swipeRefresh.setRefreshing(false);
            }

            @Override
            public boolean onShowFileChooser(
                    WebView view,
                    ValueCallback<Uri[]> filePath,
                    FileChooserParams fileChooserParams
            ) {
                if (filePathCallback != null) filePathCallback.onReceiveValue(null);
                filePathCallback = filePath;
                return openFileChooser(fileChooserParams);
            }
        });

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                progressBar.setVisibility(View.VISIBLE);
                errorView.setVisibility(View.GONE);
                swipeRefresh.setVisibility(View.VISIBLE);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                progressBar.setVisibility(View.GONE);
                swipeRefresh.setRefreshing(false);
                injectNativeHelpers();
                rememberHistory(url);
                hideSplash();
            }

            @Override
            public void onReceivedError(
                    WebView view,
                    WebResourceRequest request,
                    WebResourceError error
            ) {
                if (request.isForMainFrame()) {
                    progressBar.setVisibility(View.GONE);
                    swipeRefresh.setRefreshing(false);
                    swipeRefresh.setVisibility(View.GONE);
                    errorView.setVisibility(View.VISIBLE);
                }
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return handleUri(request.getUrl());
            }
        });

        webView.setDownloadListener((url, userAgent, contentDisposition, mimeType, contentLength) ->
                downloadFile(url, userAgent, contentDisposition, mimeType)
        );

        if (savedInstanceState == null) {
            Uri incoming = getIntent() != null ? getIntent().getData() : null;
            webView.loadUrl(isZemZemUri(incoming) ? incoming.toString() : HOME_URL);
        } else {
            webView.restoreState(savedInstanceState);
        }
    }

    private LinearLayout buildSplashView() {
        LinearLayout view = new LinearLayout(this);
        view.setOrientation(LinearLayout.VERTICAL);
        view.setGravity(Gravity.CENTER);
        view.setBackgroundColor(Color.WHITE);

        ImageView logo = new ImageView(this);
        logo.setImageResource(R.drawable.zemzem_mark);
        int size = (int) (112 * getResources().getDisplayMetrics().density);
        view.addView(logo, new LinearLayout.LayoutParams(size, size));

        TextView brand = new TextView(this);
        brand.setText("ZEMZEM");
        brand.setTextSize(26);
        brand.setTextColor(0xFF159DA8);
        brand.setGravity(Gravity.CENTER);
        brand.setPadding(0, 18, 0, 6);
        view.addView(brand);

        TextView subtitle = new TextView(this);
        subtitle.setText("Shtëpi botuese dhe shpërndarëse");
        subtitle.setTextSize(13);
        subtitle.setTextColor(0xFF60706A);
        subtitle.setGravity(Gravity.CENTER);
        view.addView(subtitle);

        return view;
    }

    private void hideSplash() {
        if (splashView == null || splashView.getVisibility() != View.VISIBLE) return;
        splashView.animate()
                .alpha(0f)
                .setDuration(280)
                .withEndAction(() -> {
                    splashView.setVisibility(View.GONE);
                    splashView.setAlpha(1f);
                })
                .start();
    }

    private LinearLayout buildOfflineView() {
        LinearLayout view = new LinearLayout(this);
        view.setOrientation(LinearLayout.VERTICAL);
        view.setGravity(Gravity.CENTER);
        view.setPadding(48, 48, 48, 48);
        view.setBackgroundColor(0xFFFFFFFF);
        view.setVisibility(View.GONE);

        TextView title = new TextView(this);
        title.setText("Nuk ka lidhje me internetin");
        title.setTextSize(20);
        title.setGravity(Gravity.CENTER);

        TextView text = new TextView(this);
        text.setText("Kontrollo lidhjen dhe provo përsëri.");
        text.setTextSize(14);
        text.setGravity(Gravity.CENTER);
        text.setPadding(0, 16, 0, 24);

        Button retry = new Button(this);
        retry.setText("Provo përsëri");
        retry.setOnClickListener(v -> {
            errorView.setVisibility(View.GONE);
            swipeRefresh.setVisibility(View.VISIBLE);
            webView.reload();
        });

        view.addView(title);
        view.addView(text);
        view.addView(retry);
        return view;
    }

    private boolean openFileChooser(WebChromeClient.FileChooserParams params) {
        Intent contentIntent;
        try {
            contentIntent = params.createIntent();
        } catch (Exception e) {
            contentIntent = new Intent(Intent.ACTION_GET_CONTENT);
            contentIntent.addCategory(Intent.CATEGORY_OPENABLE);
            contentIntent.setType("*/*");
        }

        Intent cameraIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
        try {
            File photo = File.createTempFile(
                    "zemzem_camera_",
                    ".jpg",
                    getExternalFilesDir(Environment.DIRECTORY_PICTURES)
            );
            cameraImageUri = FileProvider.getUriForFile(
                    this,
                    getPackageName() + ".fileprovider",
                    photo
            );
            cameraIntent.putExtra(MediaStore.EXTRA_OUTPUT, cameraImageUri);
            cameraIntent.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION | Intent.FLAG_GRANT_READ_URI_PERMISSION);
        } catch (IOException e) {
            cameraIntent = null;
            cameraImageUri = null;
        }

        Intent chooser = Intent.createChooser(contentIntent, "Zgjidh fotografinë ose skedarin");
        if (cameraIntent != null) chooser.putExtra(Intent.EXTRA_INITIAL_INTENTS, new Intent[]{cameraIntent});

        try {
            startActivityForResult(chooser, FILE_CHOOSER_REQUEST);
            return true;
        } catch (ActivityNotFoundException e) {
            filePathCallback = null;
            Toast.makeText(this, "Nuk u gjet aplikacion për zgjedhjen e skedarit.", Toast.LENGTH_SHORT).show();
            return false;
        }
    }

    private void downloadFile(String url, String userAgent, String contentDisposition, String mimeType) {
        try {
            String fileName = URLUtil.guessFileName(url, contentDisposition, mimeType);
            DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
            request.setMimeType(mimeType);
            request.addRequestHeader("User-Agent", userAgent);
            String cookies = CookieManager.getInstance().getCookie(url);
            if (cookies != null) request.addRequestHeader("Cookie", cookies);
            request.setTitle(fileName);
            request.setDescription("Duke shkarkuar nga ZemZem");
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName);

            DownloadManager manager = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
            manager.enqueue(request);
            rememberDownload(fileName);
            Toast.makeText(this, "Shkarkimi filloi.", Toast.LENGTH_SHORT).show();
        } catch (Exception e) {
            try {
                startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
            } catch (Exception ignored) {
                Toast.makeText(this, "Shkarkimi nuk mund të fillojë.", Toast.LENGTH_SHORT).show();
            }
        }
    }

    private void injectNativeHelpers() {
        String script =
                "(function(){" +
                "window.ZemZemNative=window.ZemZemNative||{};" +
                "window.ZemZemNative.share=function(title,url){ZemZemAndroid.share(title||document.title,url||location.href);};" +
                "window.ZemZemNative.notify=function(title,body){ZemZemAndroid.notify(title||'ZemZem',body||'');};" +
                "window.ZemZemNative.favorite=function(title,url){ZemZemAndroid.favorite(title||document.title,url||location.href);};" +
                "window.ZemZemNative.about=function(){ZemZemAndroid.about();};" +
                "try{Object.defineProperty(navigator,'share',{configurable:true,value:function(d){ZemZemAndroid.share((d&&d.title)||document.title,(d&&d.url)||location.href);return Promise.resolve();}});}catch(e){}" +
                "})();";
        webView.evaluateJavascript(script, null);
    }

    private boolean handleUri(Uri uri) {
        if (uri == null) return false;

        String scheme = uri.getScheme() == null ? "" : uri.getScheme().toLowerCase();

        if (("http".equals(scheme) || "https".equals(scheme)) && isZemZemUri(uri)) {
            return false;
        }

        if ("intent".equals(scheme)) {
            try {
                Intent intent = Intent.parseUri(uri.toString(), Intent.URI_INTENT_SCHEME);
                startActivity(intent);
                return true;
            } catch (Exception e) {
                return true;
            }
        }

        try {
            startActivity(new Intent(Intent.ACTION_VIEW, uri));
            return true;
        } catch (Exception e) {
            Toast.makeText(this, "Ky link nuk mund të hapet.", Toast.LENGTH_SHORT).show();
            return true;
        }
    }

    private boolean isZemZemUri(Uri uri) {
        if (uri == null || uri.getHost() == null) return false;
        String host = uri.getHost().toLowerCase();
        return "zemzem.al".equals(host) || "www.zemzem.al".equals(host);
    }

    private void shareContent(String title, String url) {
        Intent share = new Intent(Intent.ACTION_SEND);
        share.setType("text/plain");
        share.putExtra(Intent.EXTRA_SUBJECT, title);
        share.putExtra(Intent.EXTRA_TEXT, (title == null ? "" : title + "\n") + url);
        startActivity(Intent.createChooser(share, "Shpërndaje me"));
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Njoftimet ZemZem",
                    NotificationManager.IMPORTANCE_DEFAULT
            );
            channel.setDescription("Porosi, oferta dhe njoftime nga ZemZem");
            channel.setShowBadge(true);
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(channel);
        }
    }

    private void requestNotificationPermissionIfNeeded() {
        if (Build.VERSION.SDK_INT >= 33 &&
                checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(
                    new String[]{Manifest.permission.POST_NOTIFICATIONS},
                    NOTIFICATION_PERMISSION_REQUEST
            );
        }
    }

    private void showLocalNotification(String title, String body) {
        NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        int number = getPreferences(MODE_PRIVATE).getInt("badge_number", 0) + 1;
        getPreferences(MODE_PRIVATE).edit().putInt("badge_number", number).apply();

        Intent open = new Intent(this, MainActivity.class);
        open.setData(Uri.parse(HOME_URL));
        PendingIntent pending = PendingIntent.getActivity(
                this,
                0,
                open,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        Notification.Builder builder = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                ? new Notification.Builder(this, CHANNEL_ID)
                : new Notification.Builder(this);

        builder.setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle(title == null || title.isEmpty() ? "ZemZem" : title)
                .setContentText(body == null ? "" : body)
                .setAutoCancel(true)
                .setContentIntent(pending)
                .setNumber(number);

        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            builder.setPriority(Notification.PRIORITY_DEFAULT);
        }

        manager.notify((int) System.currentTimeMillis(), builder.build());
    }

    public class AppBridge {
        @JavascriptInterface
        public void share(String title, String url) {
            runOnUiThread(() -> shareContent(title, url));
        }

        @JavascriptInterface
        public void notify(String title, String body) {
            runOnUiThread(() -> showLocalNotification(title, body));
        }

        @JavascriptInterface
        public void favorite(String title, String url) {
            runOnUiThread(() -> toggleFavorite(title, url));
        }

        @JavascriptInterface
        public void about() {
            runOnUiThread(this::showAboutDialog);
        }
    }


    private LinearLayout buildBottomNavigation() {
        LinearLayout nav = new LinearLayout(this);
        nav.setOrientation(LinearLayout.HORIZONTAL);
        nav.setGravity(Gravity.CENTER);
        nav.setBackgroundColor(Color.WHITE);
        nav.setPadding(4, 4, 4, 4);
        nav.setElevation(18f);

        addNavButton(nav, "Ballina", () -> webView.loadUrl(HOME_URL));
        addNavButton(nav, "Shop", () -> webView.loadUrl("https://www.zemzem.al/shop.html"));
        addNavButton(nav, "Kërko", this::showSearchDialog);
        addNavButton(nav, "Shporta", () -> webView.loadUrl("https://www.zemzem.al/checkout.html"));
        addNavButton(nav, "Llogaria", this::showAccountMenu);
        return nav;
    }

    private void addNavButton(LinearLayout nav, String label, Runnable action) {
        Button button = new Button(this);
        button.setText(label);
        button.setTextSize(11);
        button.setAllCaps(false);
        button.setPadding(2, 0, 2, 0);
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.MATCH_PARENT, 1f);
        button.setLayoutParams(params);
        button.setOnClickListener(v -> action.run());
        nav.addView(button);
    }

    private void showSearchDialog() {
        EditText input = new EditText(this);
        input.setHint("Kërko libra...");
        input.setSingleLine(true);

        new AlertDialog.Builder(this)
                .setTitle("Kërko në ZemZem")
                .setView(input)
                .setPositiveButton("Kërko", (dialog, which) -> {
                    String q = input.getText().toString().trim();
                    if (!q.isEmpty()) {
                        webView.loadUrl("https://www.zemzem.al/shop.html?q=" + Uri.encode(q));
                    }
                })
                .setNegativeButton("Anulo", null)
                .show();
    }

    private void showAccountMenu() {
        String[] items = {
                "Llogaria ime",
                "Të preferuarat",
                "Të fundit",
                "Shkarkimet",
                "Rreth aplikacionit"
        };
        new AlertDialog.Builder(this)
                .setTitle("ZemZem")
                .setItems(items, (dialog, which) -> {
                    switch (which) {
                        case 0: webView.loadUrl("https://www.zemzem.al/account.html"); break;
                        case 1: showSavedList("Të preferuarat", PREF_FAVORITES); break;
                        case 2: showSavedList("Të fundit", PREF_HISTORY); break;
                        case 3: showSavedList("Shkarkimet", PREF_DOWNLOADS); break;
                        case 4: showAboutDialog(); break;
                    }
                })
                .show();
    }

    private void toggleFavorite(String title, String url) {
        if (url == null || url.trim().isEmpty()) return;
        SharedPreferences prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        LinkedHashSet<String> set = new LinkedHashSet<>(prefs.getStringSet(PREF_FAVORITES, new LinkedHashSet<>()));
        String item = (title == null ? "ZemZem" : title.replace("|", " ")) + "|" + url;
        boolean removed = false;
        for (String existing : new ArrayList<>(set)) {
            if (existing.endsWith("|" + url)) {
                set.remove(existing);
                removed = true;
            }
        }
        if (!removed) set.add(item);
        prefs.edit().putStringSet(PREF_FAVORITES, set).apply();
        Toast.makeText(this, removed ? "U hoq nga të preferuarat." : "U shtua te të preferuarat.", Toast.LENGTH_SHORT).show();
    }

    private void rememberHistory(String url) {
        if (url == null || !url.startsWith("https://www.zemzem.al/")) return;
        if (url.endsWith("/") || url.contains("checkout") || url.contains("account")) return;
        SharedPreferences prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        LinkedHashSet<String> set = new LinkedHashSet<>(prefs.getStringSet(PREF_HISTORY, new LinkedHashSet<>()));
        for (String existing : new ArrayList<>(set)) {
            if (existing.endsWith("|" + url)) set.remove(existing);
        }
        set.add(webView.getTitle().replace("|"," ") + "|" + url);
        while (set.size() > 20) {
            String first = set.iterator().next();
            set.remove(first);
        }
        prefs.edit().putStringSet(PREF_HISTORY, set).apply();
    }

    private void rememberDownload(String fileName) {
        SharedPreferences prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        LinkedHashSet<String> set = new LinkedHashSet<>(prefs.getStringSet(PREF_DOWNLOADS, new LinkedHashSet<>()));
        set.add(fileName);
        while (set.size() > 30) {
            String first = set.iterator().next();
            set.remove(first);
        }
        prefs.edit().putStringSet(PREF_DOWNLOADS, set).apply();
    }

    private void showSavedList(String title, String key) {
        SharedPreferences prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        Set<String> raw = prefs.getStringSet(key, new LinkedHashSet<>());
        List<String> items = new ArrayList<>(raw);

        if (items.isEmpty()) {
            new AlertDialog.Builder(this)
                    .setTitle(title)
                    .setMessage("Ende nuk ka të dhëna.")
                    .setPositiveButton("OK", null)
                    .show();
            return;
        }

        String[] labels = new String[items.size()];
        for (int i = 0; i < items.size(); i++) {
            String item = items.get(i);
            labels[i] = item.contains("|") ? item.substring(0, item.indexOf('|')) : item;
        }

        new AlertDialog.Builder(this)
                .setTitle(title)
                .setItems(labels, (dialog, which) -> {
                    String item = items.get(which);
                    if (PREF_DOWNLOADS.equals(key)) {
                        Intent downloads = new Intent(DownloadManager.ACTION_VIEW_DOWNLOADS);
                        startActivity(downloads);
                    } else if (item.contains("|")) {
                        String url = item.substring(item.indexOf('|') + 1);
                        webView.loadUrl(url);
                    }
                })
                .setNegativeButton("Mbyll", null)
                .show();
    }

    private void showAboutDialog() {
        String message = "Versioni 1.2.0\n\n" +
                "ZemZem.al\nShtëpi botuese dhe shpërndarëse\n\n" +
                "Privacy Policy • Terms • Kontakt";
        new AlertDialog.Builder(this)
                .setTitle("Rreth ZemZem")
                .setMessage(message)
                .setPositiveButton("Kontrollo update", (d,w) -> checkForUpdate())
                .setNeutralButton("Privacy", (d,w) -> webView.loadUrl("https://www.zemzem.al/privacy.html"))
                .setNegativeButton("Mbyll", null)
                .show();
    }

    private void checkForUpdate() {
        Toast.makeText(this, "Po kontrolloj versionin më të fundit...", Toast.LENGTH_SHORT).show();
        webView.loadUrl("https://www.zemzem.al/");
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        Uri uri = intent != null ? intent.getData() : null;
        if (webView != null && isZemZemUri(uri)) {
            webView.loadUrl(uri.toString());
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == FILE_CHOOSER_REQUEST) {
            List<Uri> uris = new ArrayList<>();

            if (resultCode == RESULT_OK) {
                if (data != null && data.getClipData() != null) {
                    ClipData clip = data.getClipData();
                    for (int i = 0; i < clip.getItemCount(); i++) {
                        uris.add(clip.getItemAt(i).getUri());
                    }
                } else if (data != null && data.getData() != null) {
                    uris.add(data.getData());
                } else if (cameraImageUri != null) {
                    uris.add(cameraImageUri);
                }
            }

            if (filePathCallback != null) {
                filePathCallback.onReceiveValue(uris.isEmpty() ? null : uris.toArray(new Uri[0]));
                filePathCallback = null;
            }
            cameraImageUri = null;
            return;
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    protected void onPause() {
        CookieManager.getInstance().flush();
        super.onPause();
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        webView.saveState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override
    protected void onDestroy() {
        CookieManager.getInstance().flush();
        if (webView != null) {
            webView.removeJavascriptInterface("ZemZemAndroid");
            webView.destroy();
        }
        super.onDestroy();
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
