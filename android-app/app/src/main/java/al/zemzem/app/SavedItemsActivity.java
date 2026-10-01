package al.zemzem.app;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.DownloadManager;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

public class SavedItemsActivity extends Activity {
    private static final String PREFS = "zemzem_app";
    private LinearLayout contentBox;
    private String mode;
    private String key;
    private SharedPreferences prefs;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        mode = getIntent().getStringExtra("mode");
        if (mode == null) mode = "favorites";
        key = "favorites".equals(mode) ? "favorites" :
                "history".equals(mode) ? "history" : "downloads";
        prefs = getSharedPreferences(PREFS, MODE_PRIVATE);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.WHITE);

        LinearLayout header = new LinearLayout(this);
        header.setOrientation(LinearLayout.HORIZONTAL);
        header.setGravity(Gravity.CENTER_VERTICAL);
        header.setPadding(20, 18, 20, 12);

        Button back = new Button(this);
        back.setText("‹");
        back.setTextSize(24);
        back.setOnClickListener(v -> finish());
        header.addView(back, new LinearLayout.LayoutParams(72, 64));

        TextView title = new TextView(this);
        title.setText(titleForMode());
        title.setTextSize(22);
        title.setTextColor(0xFF173D2B);
        title.setPadding(14, 0, 0, 0);
        header.addView(title, new LinearLayout.LayoutParams(0, 72, 1f));

        Button clear = new Button(this);
        clear.setText("Pastro");
        clear.setAllCaps(false);
        clear.setOnClickListener(v -> confirmClear());
        header.addView(clear, new LinearLayout.LayoutParams(110, 64));

        root.addView(header);

        ScrollView scroll = new ScrollView(this);
        contentBox = new LinearLayout(this);
        contentBox.setOrientation(LinearLayout.VERTICAL);
        contentBox.setPadding(18, 8, 18, 24);
        scroll.addView(contentBox);
        root.addView(scroll, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                0,
                1f
        ));

        setContentView(root);
        render();
    }

    private String titleForMode() {
        if ("history".equals(mode)) return "Shikuar së fundmi";
        if ("downloads".equals(mode)) return "Shkarkimet";
        return "Të preferuarat";
    }

    private void render() {
        contentBox.removeAllViews();
        Set<String> raw = prefs.getStringSet(key, new LinkedHashSet<>());
        List<String> items = new ArrayList<>(raw);

        if (items.isEmpty()) {
            TextView empty = new TextView(this);
            empty.setText("Ende nuk ka të dhëna.");
            empty.setTextSize(16);
            empty.setGravity(Gravity.CENTER);
            empty.setPadding(16, 80, 16, 30);
            contentBox.addView(empty);
            return;
        }

        for (String item : items) {
            contentBox.addView(buildCard(item));
        }
    }

    private View buildCard(String item) {
        LinearLayout card = new LinearLayout(this);
        card.setOrientation(LinearLayout.VERTICAL);
        card.setPadding(18, 16, 18, 14);
        card.setBackgroundColor(0xFFF7FBFA);

        LinearLayout.LayoutParams cardParams = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
        );
        cardParams.setMargins(0, 0, 0, 12);
        card.setLayoutParams(cardParams);

        String label = item;
        String url = null;
        int split = item.indexOf('|');
        if (split >= 0) {
            label = item.substring(0, split);
            url = item.substring(split + 1);
        }

        TextView title = new TextView(this);
        title.setText(label);
        title.setTextSize(16);
        title.setTextColor(0xFF173D2B);
        card.addView(title);

        LinearLayout actions = new LinearLayout(this);
        actions.setOrientation(LinearLayout.HORIZONTAL);
        actions.setPadding(0, 10, 0, 0);

        Button open = new Button(this);
        open.setAllCaps(false);
        open.setText("downloads".equals(mode) ? "Hap Downloads" : "Hap");
        final String targetUrl = url;
        open.setOnClickListener(v -> {
            if ("downloads".equals(mode)) {
                try {
                    startActivity(new Intent(DownloadManager.ACTION_VIEW_DOWNLOADS));
                } catch (Exception e) {
                    Toast.makeText(this, "Downloads nuk mund të hapet.", Toast.LENGTH_SHORT).show();
                }
            } else if (targetUrl != null) {
                Intent i = new Intent(this, MainActivity.class);
                i.setData(Uri.parse(targetUrl));
                startActivity(i);
                finish();
            }
        });
        actions.addView(open, new LinearLayout.LayoutParams(0, 56, 1f));

        Button remove = new Button(this);
        remove.setAllCaps(false);
        remove.setText("Hiq");
        final String original = item;
        remove.setOnClickListener(v -> removeItem(original));
        actions.addView(remove, new LinearLayout.LayoutParams(0, 56, 1f));

        card.addView(actions);
        return card;
    }

    private void removeItem(String item) {
        LinkedHashSet<String> set = new LinkedHashSet<>(prefs.getStringSet(key, new LinkedHashSet<>()));
        set.remove(item);
        prefs.edit().putStringSet(key, set).apply();
        render();
    }

    private void confirmClear() {
        new AlertDialog.Builder(this)
                .setTitle("Pastro listën")
                .setMessage("A dëshiron ta pastrosh këtë listë?")
                .setPositiveButton("Po", (d,w) -> {
                    prefs.edit().remove(key).apply();
                    render();
                })
                .setNegativeButton("Jo", null)
                .show();
    }
}
