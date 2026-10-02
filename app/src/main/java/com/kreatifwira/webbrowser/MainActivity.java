package com.kreatifwira.webbrowser;

import android.app.*;
import android.os.*;
import android.content.*;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.net.Uri;
import android.view.*;
import android.view.inputmethod.EditorInfo;
import android.webkit.*;
import androidx.browser.customtabs.CustomTabsIntent;
import android.widget.*;
import java.util.*;

public class MainActivity extends Activity {
    WebView web;
    EditText address;
    ProgressBar progress;
    LinearLayout root;
    TextView status;
    String home = "https://www.google.com";
    boolean desktop = false;

    @Override public void onCreate(Bundle b) {
        super.onCreate(b);
        buildUi();
        configureWebView();
        open(home);
    }

    void buildUi() {
        root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(0xff0b0f14);

        LinearLayout bar = new LinearLayout(this);
        bar.setGravity(Gravity.CENTER_VERTICAL);
        bar.setPadding(4,4,4,4);

        String[] buttons = {"‹","›","↻","⌂"};
        for (String s: buttons) {
            Button x = new Button(this);
            x.setText(s);
            x.setTextSize(18);
            x.setMinWidth(46);
            bar.addView(x, new LinearLayout.LayoutParams(46,52));
            if (s.equals("‹")) x.setOnClickListener(v -> { if(web.canGoBack()) web.goBack(); });
            if (s.equals("›")) x.setOnClickListener(v -> { if(web.canGoForward()) web.goForward(); });
            if (s.equals("↻")) x.setOnClickListener(v -> web.reload());
            if (s.equals("⌂")) x.setOnClickListener(v -> open(home));
        }

        address = new EditText(this);
        address.setSingleLine(true);
        address.setHint("Cari atau masukkan alamat");
        address.setTextColor(Color.WHITE);
        address.setHintTextColor(0xff9ca3af);
        address.setBackgroundColor(0xff171d26);
        address.setPadding(14,0,10,0);
        address.setImeOptions(EditorInfo.IME_ACTION_GO);
        address.setInputType(33);
        address.setOnEditorActionListener((v,id,e)->{
            if(id==EditorInfo.IME_ACTION_GO){ open(address.getText().toString()); return true; }
            return false;
        });
        bar.addView(address,new LinearLayout.LayoutParams(0,52,1));

        Button menu = new Button(this);
        menu.setText("⋮");
        menu.setTextSize(20);
        menu.setMinWidth(46);
        bar.addView(menu,new LinearLayout.LayoutParams(46,52));
        menu.setOnClickListener(v -> showMenu(menu));

        progress = new ProgressBar(this,null,android.R.attr.progressBarStyleHorizontal);
        progress.setMax(100);
        progress.setVisibility(View.GONE);

        status = new TextView(this);
        status.setTextColor(0xffcbd5e1);
        status.setTextSize(12);
        status.setPadding(12,4,12,4);
        status.setVisibility(View.GONE);

        web = new WebView(this);
        root.addView(bar);
        root.addView(progress,new LinearLayout.LayoutParams(-1,3));
        root.addView(status,new LinearLayout.LayoutParams(-1,30));
        root.addView(web,new LinearLayout.LayoutParams(-1,0,1));
        setContentView(root);
    }

    void configureWebView() {
        WebSettings s=web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setSupportZoom(true);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setLoadWithOverviewMode(false);
        s.setUseWideViewPort(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setJavaScriptCanOpenWindowsAutomatically(true);
        s.setSupportMultipleWindows(true);
        // Use a modern mobile-Chrome style UA for better website compatibility.
        s.setUserAgentString("Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Mobile Safari/537.36");
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);

        CookieManager cm=CookieManager.getInstance();
        cm.setAcceptCookie(true);
        cm.setAcceptThirdPartyCookies(web,true);

        web.setWebViewClient(new WebViewClient(){
            @Override public boolean shouldOverrideUrlLoading(WebView v,String u){
                if(u==null) return false;
                if(u.startsWith("http://")||u.startsWith("https://")) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW,Uri.parse(u))); } catch(Exception ignored){}
                return true;
            }

            @Override public void onPageStarted(WebView v,String u,Bitmap b){
                address.setText(u);
                progress.setVisibility(View.VISIBLE);
                status.setVisibility(View.GONE);
            }

            @Override public void onPageFinished(WebView v,String u){
                address.setText(u);
                progress.setVisibility(View.GONE);
                status.setVisibility(View.GONE);
                CookieManager.getInstance().flush();
            }

            @Override public void onReceivedError(WebView v,WebResourceRequest r,WebResourceError e){
                if(r.isForMainFrame()) showError("Halaman gagal dimuat: "+e.getDescription());
            }

            @Override public void onReceivedHttpError(WebView v,WebResourceRequest r,WebResourceResponse e){
                if(r.isForMainFrame() && e.getStatusCode() >= 400)
                    showError("Server mengembalikan HTTP "+e.getStatusCode());
            }

            @Override public void onReceivedSslError(WebView v,SslErrorHandler h,android.net.http.SslError e){
                h.cancel();
                showError("Koneksi HTTPS tidak dapat diverifikasi.");
            }
        });

        web.setWebChromeClient(new WebChromeClient(){
            @Override public void onProgressChanged(WebView v,int p){
                progress.setProgress(p);
                if(p>=100) progress.setVisibility(View.GONE);
                else progress.setVisibility(View.VISIBLE);
            }

            @Override public boolean onCreateWindow(WebView view, boolean dialog, boolean userGesture, android.os.Message resultMsg){
                WebView popup = new WebView(MainActivity.this);
                configurePopup(popup);
                WebView.WebViewTransport transport=(WebView.WebViewTransport)resultMsg.obj;
                transport.setWebView(popup);
                resultMsg.sendToTarget();
                return true;
            }

            @Override public void onReceivedTitle(WebView view,String title){
                if(title!=null && !title.isEmpty()) setTitle(title);
            }
        });

        web.setDownloadListener((url,userAgent,contentDisposition,mimeType,contentLength)->{
            try {
                Intent i=new Intent(Intent.ACTION_VIEW,Uri.parse(url));
                startActivity(i);
            } catch(Exception ignored) {
                showError("Tidak dapat membuka file.");
            }
        });
    }

    void configurePopup(WebView popup) {
        WebSettings ps=popup.getSettings();
        ps.setJavaScriptEnabled(true);
        ps.setDomStorageEnabled(true);
        ps.setJavaScriptCanOpenWindowsAutomatically(true);
        ps.setSupportMultipleWindows(true);
        ps.setUserAgentString(web.getSettings().getUserAgentString());
        popup.setWebViewClient(new WebViewClient(){
            @Override public boolean shouldOverrideUrlLoading(WebView v,String url){
                if(url==null) return true;
                if(url.startsWith("http://")||url.startsWith("https://")) { web.loadUrl(url); return true; }
                try { startActivity(new Intent(Intent.ACTION_VIEW,Uri.parse(url))); } catch(Exception ignored) {}
                return true;
            }
            @Override public void onPageStarted(WebView v,String url,Bitmap b){ address.setText(url); }
        });
        popup.setWebChromeClient(new WebChromeClient());
    }

    void showError(String message) {
        status.setText(message);
        status.setVisibility(View.VISIBLE);
    }

    void open(String raw) {
        if(raw==null) return;
        String q=raw.trim();
        if(q.isEmpty()) return;
        if(!q.matches("^[a-zA-Z][a-zA-Z0-9+.-]*://.*$")) {
            if(q.contains(" ") || !q.contains(".")) q="https://www.google.com/search?q="+Uri.encode(q);
            else q="https://"+q;
        }
        address.setText(q);
        try {
            CustomTabsIntent intent = new CustomTabsIntent.Builder().build();
            intent.launchUrl(this, Uri.parse(q));
        } catch (Exception e) {
            try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(q))); }
            catch (Exception ignored) { showError("Browser Chrome tidak tersedia."); }
        }
    }

    void showMenu(View anchor) {
        PopupMenu p=new PopupMenu(this,anchor);
        p.getMenu().add("Mode desktop").setCheckable(true).setChecked(desktop);
        p.getMenu().add("Salin URL");
        p.getMenu().add("Buka di browser HP");
        p.getMenu().add("Beranda");
        p.setOnMenuItemClickListener(item->{
            String t=item.getTitle().toString();
            if(t.equals("Mode desktop")){
                desktop=!desktop;
                String ua=desktop
                    ? "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/154 Safari/537.36"
                    : WebSettings.getDefaultUserAgent(this);
                web.getSettings().setUserAgentString(ua);
                web.reload();
            } else if(t.equals("Salin URL")){
                ((android.content.ClipboardManager)getSystemService(CLIPBOARD_SERVICE))
                    .setPrimaryClip(ClipData.newPlainText("URL",web.getUrl()==null?"":web.getUrl()));
            } else if(t.equals("Buka di browser HP")){
                try { startActivity(new Intent(Intent.ACTION_VIEW,Uri.parse(web.getUrl()))); } catch(Exception ignored){}
            } else if(t.equals("Beranda")) open(home);
            return true;
        });
        p.show();
    }

    @Override public void onBackPressed(){
        if(web.canGoBack()) web.goBack(); else super.onBackPressed();
    }
}