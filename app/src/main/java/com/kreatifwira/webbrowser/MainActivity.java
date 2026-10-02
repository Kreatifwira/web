package com.kreatifwira.webbrowser;

import android.app.*;
import android.os.*;
import android.content.*;
import android.graphics.Color;
import android.net.Uri;
import android.view.*;
import android.view.inputmethod.EditorInfo;
import android.webkit.*;
import androidx.browser.customtabs.CustomTabsIntent;
import android.widget.*;

public class MainActivity extends Activity {
    EditText address;
    LinearLayout root;
    String home = "https://1xraja.com/id";

    @Override public void onCreate(Bundle b) {
        super.onCreate(b);
        buildUi();
        open(home);
    }

    void buildUi() {
        root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(0xff0b0f14);

        LinearLayout bar = new LinearLayout(this);
        bar.setGravity(Gravity.CENTER_VERTICAL);
        bar.setPadding(4,4,4,4);

        Button homeButton = new Button(this);
        homeButton.setText("⌂");
        homeButton.setTextSize(18);
        homeButton.setMinWidth(52);
        bar.addView(homeButton, new LinearLayout.LayoutParams(52,52));
        homeButton.setOnClickListener(v -> open(home));

        address = new EditText(this);
        address.setSingleLine(true);
        address.setHint("Masukkan alamat website");
        address.setTextColor(Color.WHITE);
        address.setHintTextColor(0xff9ca3af);
        address.setBackgroundColor(0xff171d26);
        address.setPadding(14,0,10,0);
        address.setImeOptions(EditorInfo.IME_ACTION_GO);
        address.setInputType(33);
        address.setOnEditorActionListener((v,id,e)->{
            if(id == EditorInfo.IME_ACTION_GO) {
                open(address.getText().toString());
                return true;
            }
            return false;
        });
        bar.addView(address, new LinearLayout.LayoutParams(0,52,1));

        Button chromeButton = new Button(this);
        chromeButton.setText("Chrome");
        chromeButton.setTextSize(12);
        chromeButton.setMinWidth(82);
        bar.addView(chromeButton, new LinearLayout.LayoutParams(82,52));
        chromeButton.setOnClickListener(v -> open(address.getText().toString()));

        root.addView(bar);

        TextView info = new TextView(this);
        info.setText("1xraja.com dibuka langsung menggunakan Google Chrome.\n\nTidak menggunakan iframe atau WebView.");
        info.setTextColor(0xffcbd5e1);
        info.setTextSize(15);
        info.setGravity(Gravity.CENTER);
        info.setPadding(24,24,24,24);

        Button openButton = new Button(this);
        openButton.setText("BUKA 1XRAJA DI CHROME");
        openButton.setTextSize(15);
        openButton.setOnClickListener(v -> open(home));

        root.addView(info, new LinearLayout.LayoutParams(-1,0,1));
        root.addView(openButton, new LinearLayout.LayoutParams(-1,58));

        setContentView(root);
    }

    void open(String raw) {
        if(raw == null) return;
        String q = raw.trim();
        if(q.isEmpty()) q = home;

        if(!q.matches("^[a-zA-Z][a-zA-Z0-9+.-]*://.*$")) {
            if(q.contains(" ") || !q.contains(".")) {
                q = "https://www.google.com/search?q=" + Uri.encode(q);
            } else {
                q = "https://" + q;
            }
        }

        address.setText(q);

        Uri uri = Uri.parse(q);

        // 1. Prioritas: Google Chrome.
        try {
            Intent chrome = new Intent(Intent.ACTION_VIEW, uri);
            chrome.setPackage("com.android.chrome");
            chrome.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(chrome);
            return;
        } catch (Exception ignored) {}

        // 2. Fallback: Chrome Custom Tab / browser yang kompatibel.
        try {
            CustomTabsIntent intent = new CustomTabsIntent.Builder().build();
            intent.launchUrl(this, uri);
            return;
        } catch (Exception ignored) {}

        // 3. Fallback terakhir: browser Android biasa.
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, uri));
        } catch (Exception ignored) {
            Toast.makeText(this, "Google Chrome/browser tidak tersedia.", Toast.LENGTH_LONG).show();
        }
    }
}
