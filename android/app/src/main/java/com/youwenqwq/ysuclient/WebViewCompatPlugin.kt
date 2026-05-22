package com.youwenqwq.ysuclient

import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import androidx.appcompat.app.AlertDialog
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(name = "WebViewCompat")
class WebViewCompatPlugin : Plugin() {

    companion object {
        private const val PREF_NAME = "webview_compat"
        private const val PREF_DISMISSED = "dismissed"
        private const val MIN_VERSION = 111
        private const val FAQ_URL = "https://ysu.welain.com/faq"
        private val WEBVIEW_PACKAGES = listOf(
            "com.google.android.webview",
            "com.android.webview",
            "com.google.android.webview.beta",
            "com.google.android.webview.dev",
            "com.google.android.webview.canary",
            "com.chrome.beta",
            "com.chrome.dev",
            "com.chrome.canary",
            "com.chrome",
        )
    }

    @PluginMethod
    fun check(call: PluginCall) {
        val ctx = context
        val version = getWebViewMajorVersion(ctx)

        if (version != null && version >= MIN_VERSION) {
            call.resolve()
            return
        }

        val prefs = ctx.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
        if (prefs.getBoolean(PREF_DISMISSED, false)) {
            call.resolve()
            return
        }

        showDialog(ctx, version, prefs)
        call.resolve()
    }

    private fun getWebViewMajorVersion(ctx: Context): Int? {
        for (packageName in WEBVIEW_PACKAGES) {
            try {
                val info = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    ctx.packageManager.getPackageInfo(packageName, PackageManager.PackageInfoFlags.of(0))
                } else {
                    @Suppress("DEPRECATION")
                    ctx.packageManager.getPackageInfo(packageName, 0)
                }
                return parseMajorVersion(info.versionName)
            } catch (_: PackageManager.NameNotFoundException) {
                continue
            }
        }
        return null
    }

    private fun parseMajorVersion(versionName: String?): Int? {
        if (versionName.isNullOrBlank()) return null
        return versionName.split(".").firstOrNull()?.toIntOrNull()
    }

    private fun showDialog(ctx: Context, version: Int?, prefs: SharedPreferences) {
        val versionText = version?.toString() ?: "未知"
        val message = if (version == null) {
            "无法检测您的 WebView 版本，应用可能无法正常显示。\n\n" +
                "建议更新 Android System WebView 以获得最佳体验。"
        } else {
            "您当前的 WebView 版本（Chrome $versionText）较低，应用可能无法正常显示。\n\n" +
                "建议更新 Android System WebView 以获得最佳体验。"
        }

        activity?.runOnUiThread {
            AlertDialog.Builder(ctx)
                .setTitle("WebView 兼容性提示")
                .setMessage(message)
                .setPositiveButton("查看帮助") { _, _ ->
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(FAQ_URL))
                    ctx.startActivity(intent)
                }
                .setNegativeButton("忽略，继续使用") { _, _ ->
                    prefs.edit().putBoolean(PREF_DISMISSED, true).apply()
                }
                .setCancelable(false)
                .show()
        }
    }
}
