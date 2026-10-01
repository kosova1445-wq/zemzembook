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
import android.os.SystemClock;
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
import android.widget.ScrollView;
import android.widget.Switch;
import android.widget.CompoundButton;

import androidx.core.content.FileProvider;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.LinkedHashSet;
import java.util.Set;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import org.json.JSONObject;

public class MainActivity extends Activity {
    private static final String HOME_URL = "https://www.zemzem.al/";
    private static final String CHANNEL_ID = "zemzem_updates";
    private static final int FILE_CHOOSER_REQUEST = 1001;
    private static final int NOTIFICATION_PERMISSION_REQUEST = 1002;
    private static final String PREFS = "zemzem_app";
    private static final String PREF_FAVORITES = "favorites";
    private static final String PREF_HISTORY = "history";
    private static final String PREF_DOWNLOADS = "downloads";
    private static final String PREF_NOTIFICATIONS = "notifications_enabled";
    private static final String PREF_ORDER_LOCK = "last_order_action";

    private WebView webView;
    private SwipeRefreshLayout swipeRefresh;
    private ProgressBar progressBar;
    private LinearLayout errorView;
    private LinearLayout splashView;
    private LinearLayout bottomNav;
    private ValueCallback<Uri[]> filePathCallback;
    private Uri cameraImageUri;
    private long lastBackPress = 0L;

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
        settings.setUserAgentString(settings.getUserAgentString() + " ZemZemAndroid/1.3.0");

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
                updateBottomNav(url);
                handlePaymentReturn(url);
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
                "window.ZemZemNative.settings=function(){ZemZemAndroid.settings();};" +
                "try{Object.defineProperty(navigator,'share',{configurable:true,value:function(d){ZemZemAndroid.share((d&&d.title)||document.title,(d&&d.url)||location.href);return Promise.resolve();}});}catch(e){}" +
                "if(location.pathname.indexOf('product.html')>=0&&!document.getElementById('zz-native-product-actions')){" +
                "var bar=document.createElement('div');bar.id='zz-native-product-actions';bar.style.cssText='position:fixed;right:12px;bottom:76px;z-index:2147483000;display:flex;gap:8px';" +
                "var fav=document.createElement('button');fav.textContent='♡ Ruaj';fav.style.cssText='border:0;border-radius:999px;padding:10px 14px;background:#fff;box-shadow:0 8px 24px rgba(0,0,0,.18);font-weight:700';fav.onclick=function(){ZemZemAndroid.favorite(document.title,location.href)};" +
                "var sh=document.createElement('button');sh.textContent='↗ Share';sh.style.cssText='border:0;border-radius:999px;padding:10px 14px;background:#159DA8;color:#fff;box-shadow:0 8px 24px rgba(0,0,0,.18);font-weight:700';sh.onclick=function(){ZemZemAndroid.share(document.title,location.href)};" +
                "bar.appendChild(fav);bar.appendChild(sh);document.body.appendChild(bar)}" +
                "if(location.pathname.indexOf('checkout.html')>=0){" +
                "document.querySelectorAll('form').forEach(function(form){if(form.dataset.zzGuard)return;form.dataset.zzGuard='1';form.addEventListener('submit',function(){var btn=form.querySelector('button[type=submit],input[type=submit]');if(btn&&!btn.dataset.zzLocked){btn.dataset.zzLocked='1';btn.disabled=true;setTimeout(function(){btn.disabled=false;delete btn.dataset.zzLocked},5000)}})})}" +
                "})();";
        webView.evaluateJavascript(script, null);
    }

    private boolean handleUri(Uri uri) {
        if (uri == null) return false;

        String scheme = uri.getScheme() == null ? "" : uri.getScheme().toLowerCase();

        if (("http".equals(scheme) || "https".equals(scheme)) && isZemZemUri(uri)) {
            return false;
        }

        if (("http".equals(scheme) || "https".equals(scheme)) && uri.getHost() != null) {
            String host = uri.getHost().toLowerCase();
            if (host.contains("paypal.com") || host.contains("paypalobjects.com")) {
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, uri));
                    return true;
                } catch (Exception ignored) {
                    return false;
                }
            }
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
        if (!getSharedPreferences(PREFS, MODE_PRIVATE).getBoolean(PREF_NOTIFICATIONS, true)) return;
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
            runOnUiThread(MainActivity.this::showAboutDialog);
        }

        @JavascriptInterface
        public void settings() {
            runOnUiThread(MainActivity.this::showSettingsDialog);
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
        button.setTag(label);
        button.setTextColor(0xFF173D2B);
        button.setBackgroundColor(Color.TRANSPARENT);
        button.setPadding(2, 0, 2, 0);
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.MATCH_PARENT, 1f);
        button.setLayoutParams(params);
        button.setOnClickListener(v -> action.run());
        nav.addView(button);
    }

    private void updateBottomNav(String url) {
        if (bottomNav == null) return;
        for (int i = 0; i < bottomNav.getChildCount(); i++) {
            View child = bottomNav.getChildAt(i);
            if (!(child instanceof Button)) continue;
            Button b = (Button) child;
            String label = String.valueOf(b.getTag());
            boolean active =
                    ("Ballina".equals(label) && (url.endsWith("/") || url.endsWith("index.html"))) ||
                    ("Shop".equals(label) && url.contains("shop.html")) ||
                    ("Shporta".equals(label) && (url.contains("checkout.html") || url.contains("paypal-return.html"))) ||
                    ("Llogaria".equals(label) && url.contains("account.html"));
            b.setTextColor(active ? 0xFF159DA8 : 0xFF173D2B);
            b.setTextSize(active ? 12 : 11);
        }
    }

    private void handlePaymentReturn(String url) {
        if (url == null) return;
        String lower = url.toLowerCase();
        if (lower.contains("paypal-return.html") || lower.contains("ebook-paypal-return.html")) {
            long now = System.currentTimeMillis();
            SharedPreferences prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
            long last = prefs.getLong(PREF_ORDER_LOCK, 0L);
            if (now - last < 2500L) return;
            prefs.edit().putLong(PREF_ORDER_LOCK, now).apply();

            if (lower.contains("cancel") || lower.contains("status=cancel")) {
                Toast.makeText(this, "Pagesa u anulua.", Toast.LENGTH_LONG).show();
            } else if (lower.contains("error") || lower.contains("status=error")) {
                Toast.makeText(this, "Pagesa nuk u përfundua.", Toast.LENGTH_LONG).show();
            } else {
                Toast.makeText(this, "Pagesa u kthye në ZemZem. Po verifikohet porosia.", Toast.LENGTH_LONG).show();
            }
        }
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
                "Shto/hiq nga të preferuarat",
                "Të preferuarat",
                "Shpërndaje faqen",
                "Të fundit",
                "Shkarkimet",
                "Cilësimet",
                "Rreth aplikacionit"
        };
        new AlertDialog.Builder(this)
                .setTitle("ZemZem")
                .setItems(items, (dialog, which) -> {
                    switch (which) {
                        case 0: webView.loadUrl("https://www.zemzem.al/account.html"); break;
                        case 1: toggleFavorite(webView.getTitle(), webView.getUrl()); break;
                        case 2: showSavedList("Të preferuarat", PREF_FAVORITES); break;
                        case 3: shareContent(webView.getTitle(), webView.getUrl()); break;
                        case 4: showSavedList("Të fundit", PREF_HISTORY); break;
                        case 5: showDownloadCenter(); break;
                        case 6: showSettingsDialog(); break;
                        case 7: showAboutDialog(); break;
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

    private void showDownloadCenter() {
        SharedPreferences prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        List<String> items = new ArrayList<>(prefs.getStringSet(PREF_DOWNLOADS, new LinkedHashSet<>()));

        if (items.isEmpty()) {
            new AlertDialog.Builder(this)
                    .setTitle("Shkarkimet")
                    .setMessage("Ende nuk ka shkarkime.")
                    .setPositiveButton("Hap Downloads", (d,w) -> {
                        try { startActivity(new Intent(DownloadManager.ACTION_VIEW_DOWNLOADS)); } catch (Exception ignored) {}
                    })
                    .setNegativeButton("Mbyll", null)
                    .show();
            return;
        }

        String[] labels = items.toArray(new String[0]);
        new AlertDialog.Builder(this)
                .setTitle("Shkarkimet")
                .setItems(labels, (dialog, which) -> {
                    try { startActivity(new Intent(DownloadManager.ACTION_VIEW_DOWNLOADS)); } catch (Exception ignored) {}
                })
                .setNeutralButton("Pastro listën", (d,w) -> {
                    prefs.edit().remove(PREF_DOWNLOADS).apply();
                    Toast.makeText(this, "Lista e shkarkimeve u pastrua.", Toast.LENGTH_SHORT).show();
                })
                .setNegativeButton("Mbyll", null)
                .show();
    }

    private void showSettingsDialog() {
        SharedPreferences prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        LinearLayout box = new LinearLayout(this);
        box.setOrientation(LinearLayout.VERTICAL);
        int pad = (int) (20 * getResources().getDisplayMetrics().density);
        box.setPadding(pad, pad, pad, pad);

        Switch notifications = new Switch(this);
        notifications.setText("Njoftimet");
        notifications.setChecked(prefs.getBoolean(PREF_NOTIFICATIONS, true));
        notifications.setOnCheckedChangeListener((buttonView, isChecked) ->
                prefs.edit().putBoolean(PREF_NOTIFICATIONS, isChecked).apply()
        );
        box.addView(notifications);

        Button clearFavorites = new Button(this);
        clearFavorites.setText("Pastro të preferuarat");
        clearFavorites.setOnClickListener(v -> {
            prefs.edit().remove(PREF_FAVORITES).apply();
            Toast.makeText(this, "Të preferuarat u pastruan.", Toast.LENGTH_SHORT).show();
        });
        box.addView(clearFavorites);

        Button clearHistory = new Button(this);
        clearHistory.setText("Pastro historikun");
        clearHistory.setOnClickListener(v -> {
            prefs.edit().remove(PREF_HISTORY).apply();
            Toast.makeText(this, "Historiku u pastrua.", Toast.LENGTH_SHORT).show();
        });
        box.addView(clearHistory);

        Button clearDownloads = new Button(this);
        clearDownloads.setText("Pastro listën e shkarkimeve");
        clearDownloads.setOnClickListener(v -> {
            prefs.edit().remove(PREF_DOWNLOADS).apply();
            Toast.makeText(this, "Lista e shkarkimeve u pastrua.", Toast.LENGTH_SHORT).show();
        });
        box.addView(clearDownloads);

        new AlertDialog.Builder(this)
                .setTitle("Cilësimet")
                .setView(box)
                .setPositiveButton("Mbyll", null)
                .show();
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
                    if (item.contains("|")) {
                        String url = item.substring(item.indexOf('|') + 1);
                        webView.loadUrl(url);
                    }
                })
                .setNeutralButton("Pastro", (d,w) -> {
                    prefs.edit().remove(key).apply();
                    Toast.makeText(this, title + " u pastrua.", Toast.LENGTH_SHORT).show();
                })
                .setNegativeButton("Mbyll", null)
                .show();
    }

    private void showAboutDialog() {
        String[] items = {
                "Kontrollo update",
                "Privacy Policy",
                "Terms",
                "Kontakt"
        };
        new AlertDialog.Builder(this)
                .setTitle("Rreth ZemZem · v1.3.0")
                .setMessage("ZemZem.al\nShtëpi botuese dhe shpërndarëse")
                .setItems(items, (d, which) -> {
                    switch (which) {
                        case 0: checkForUpdate(); break;
                        case 1: webView.loadUrl("https://www.zemzem.al/privacy.html"); break;
                        case 2: webView.loadUrl("https://www.zemzem.al/terms.html"); break;
                        case 3: webView.loadUrl("https://www.zemzem.al/contact.html"); break;
                    }
                })
                .setNegativeButton("Mbyll", null)
                .show();
    }

    private void checkForUpdate() {
        Toast.makeText(this, "Po kontrolloj versionin më të fundit...", Toast.LENGTH_SHORT).show();
        new Thread(() -> {
            HttpURLConnection connection = null;
            try {
                URL endpoint = new URL("https://www.zemzem.al/android-version.json");
                connection = (HttpURLConnection) endpoint.openConnection();
                connection.setConnectTimeout(7000);
                connection.setReadTimeout(7000);
                connection.setUseCaches(false);

                BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                StringBuilder json = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) json.append(line);
                reader.close();

                JSONObject data = new JSONObject(json.toString());
                int latestCode = data.optInt("versionCode", 4);
                String latestName = data.optString("versionName", "1.2.0");
                String downloadUrl = data.optString("downloadUrl", HOME_URL);

                runOnUiThread(() -> {
                    if (latestCode > 4) {
                        new AlertDialog.Builder(this)
                                .setTitle("Ka version të ri")
                                .setMessage("Versioni " + latestName + " është i disponueshëm.")
                                .setPositiveButton("Përditëso", (d,w) -> {
                                    try {
                                        startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(downloadUrl)));
                                    } catch (Exception ignored) {}
                                })
                                .setNegativeButton("Më vonë", null)
                                .show();
                    } else {
                        Toast.makeText(this, "Aplikacioni është i përditësuar.", Toast.LENGTH_SHORT).show();
                    }
                });
            } catch (Exception e) {
                runOnUiThread(() -> Toast.makeText(this, "Kontrolli i update dështoi.", Toast.LENGTH_SHORT).show());
            } finally {
                if (connection != null) connection.disconnect();
            }
        }).start();
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
            return;
        }

        long now = SystemClock.elapsedRealtime();
        if (now - lastBackPress < 1800) {
            super.onBackPressed();
        } else {
            lastBackPress = now;
            Toast.makeText(this, "Shtyp prapë për të dalë.", Toast.LENGTH_SHORT).show();
        }
    }
}
