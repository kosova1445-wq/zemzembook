package al.zemzem.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

public class ZemZemMessagingService extends FirebaseMessagingService {
    private static final String CHANNEL_ID = "zemzem_updates";

    @Override
    public void onNewToken(String token) {
        super.onNewToken(token);
        getSharedPreferences("zemzem_app", MODE_PRIVATE)
                .edit()
                .putString("fcm_token", token)
                .apply();
    }

    @Override
    public void onMessageReceived(RemoteMessage message) {
        super.onMessageReceived(message);

        String title = "ZemZem";
        String body = "";
        String url = "https://www.zemzem.al/";

        if (message.getNotification() != null) {
            if (message.getNotification().getTitle() != null) title = message.getNotification().getTitle();
            if (message.getNotification().getBody() != null) body = message.getNotification().getBody();
        }

        if (message.getData().get("title") != null) title = message.getData().get("title");
        if (message.getData().get("body") != null) body = message.getData().get("body");
        if (message.getData().get("url") != null) url = message.getData().get("url");

        showNotification(title, body, url);
    }

    private void showNotification(String title, String body, String url) {
        NotificationManager manager = getSystemService(NotificationManager.class);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Njoftimet ZemZem",
                    NotificationManager.IMPORTANCE_DEFAULT
            );
            channel.setShowBadge(true);
            manager.createNotificationChannel(channel);
        }

        Intent open = new Intent(this, MainActivity.class);
        open.setData(Uri.parse(url));
        open.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);

        PendingIntent pendingIntent = PendingIntent.getActivity(
                this,
                100,
                open,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        Notification.Builder builder = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                ? new Notification.Builder(this, CHANNEL_ID)
                : new Notification.Builder(this);

        builder.setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle(title)
                .setContentText(body)
                .setAutoCancel(true)
                .setContentIntent(pendingIntent);

        manager.notify((int) System.currentTimeMillis(), builder.build());
    }
}
