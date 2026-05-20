package com.youwenqwq.ysuclient.widget

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.widget.RemoteViews
import com.youwenqwq.ysuclient.R
import org.json.JSONArray
import org.json.JSONObject
import java.util.Calendar
import java.util.concurrent.TimeUnit

class ExamWidgetHelper(private val context: Context) {

    data class WidgetExam(
        val name: String,
        val examName: String?,
        val examDate: String?,
        val examTime: String?,
        val examLocation: String?,
        val seatNumber: String?
    )

    fun updateAllWidgets() {
        val appWidgetManager = AppWidgetManager.getInstance(context)

        // Update medium widgets
        val componentName = ComponentName(context, ExamWidgetProvider::class.java)
        val appWidgetIds = appWidgetManager.getAppWidgetIds(componentName)
        for (appWidgetId in appWidgetIds) {
            updateWidget(appWidgetId, appWidgetManager)
        }

        // Update 2x2 widgets
        val twoByTwoComponentName = ComponentName(context, ExamWidget2x2Provider::class.java)
        val twoByTwoAppWidgetIds = appWidgetManager.getAppWidgetIds(twoByTwoComponentName)
        for (appWidgetId in twoByTwoAppWidgetIds) {
            update2x2Widget(appWidgetId, appWidgetManager)
        }
    }

    fun updateWidget(appWidgetId: Int, appWidgetManager: AppWidgetManager) {
        val exams = loadExams()
        val upcomingExams = filterUpcomingExams(exams)
        val totalCount = upcomingExams.size
        val nearestExam = upcomingExams.firstOrNull()

        val views = RemoteViews(context.packageName, R.layout.exam_widget)

        // Header: show exam date (short format) instead of date range
        val headerText = nearestExam?.examDate?.let { formatShortDate(it) } ?: ""
        views.setTextViewText(R.id.exam_header_date, headerText)
        views.setTextViewText(
            R.id.exam_header_count,
            context.getString(R.string.widget_exam_count, totalCount)
        )

        if (nearestExam == null) {
            views.setViewVisibility(R.id.exam_countdown_content, android.view.View.GONE)
            views.setViewVisibility(R.id.exam_empty_state, android.view.View.VISIBLE)
            views.setTextViewText(R.id.exam_empty_text, context.getString(R.string.widget_exam_empty))
        } else {
            views.setViewVisibility(R.id.exam_countdown_content, android.view.View.VISIBLE)
            views.setViewVisibility(R.id.exam_empty_state, android.view.View.GONE)

            val daysRemaining = computeDaysRemaining(nearestExam)
            val examDisplayName = nearestExam.name

            // Show course name directly (bold, primary color)
            views.setTextViewText(R.id.exam_countdown_prefix, examDisplayName)
            views.setTextViewText(R.id.exam_countdown_days, daysRemaining.toString())

            // Show time portion only (e.g. "18:10-19:45")
            val timeOnly = extractTimeOnly(nearestExam.examTime)
            views.setTextViewText(R.id.exam_countdown_date, timeOnly ?: "")
        }

        // Click to open exams page
        val clickPendingIntent = WidgetConfig.createDeepLinkPendingIntent(
            context, appWidgetId, "ysuclient://exams"
        )
        views.setOnClickPendingIntent(R.id.exam_widget_container, clickPendingIntent)

        appWidgetManager.updateAppWidget(appWidgetId, views)
    }

    fun update2x2Widget(appWidgetId: Int, appWidgetManager: AppWidgetManager) {
        val exams = loadExams()
        val upcomingExams = filterUpcomingExams(exams)
        val totalCount = upcomingExams.size
        val nearestExam = upcomingExams.firstOrNull()

        val views = RemoteViews(context.packageName, R.layout.exam_widget_2x2)

        // Header: show exam date (short format)
        val headerText = nearestExam?.examDate?.let { formatShortDate(it) } ?: ""
        views.setTextViewText(R.id.exam_header_date, headerText)
        views.setTextViewText(
            R.id.exam_header_count,
            context.getString(R.string.widget_exam_count, totalCount)
        )

        if (nearestExam == null) {
            views.setViewVisibility(R.id.exam_countdown_content, android.view.View.GONE)
            views.setViewVisibility(R.id.exam_empty_state, android.view.View.VISIBLE)
            views.setTextViewText(R.id.exam_empty_text, context.getString(R.string.widget_exam_empty))
        } else {
            views.setViewVisibility(R.id.exam_countdown_content, android.view.View.VISIBLE)
            views.setViewVisibility(R.id.exam_empty_state, android.view.View.GONE)

            val daysRemaining = computeDaysRemaining(nearestExam)
            val examDisplayName = nearestExam.name

            // Show course name directly (truncate for 2x2 widget)
            val shortName = if (examDisplayName.length > 9) examDisplayName.take(8) + "…" else examDisplayName
            views.setTextViewText(R.id.exam_countdown_prefix, shortName)
            views.setTextViewText(R.id.exam_countdown_days, daysRemaining.toString())

            // Show time portion only
            val timeOnly = extractTimeOnly(nearestExam.examTime)
            views.setTextViewText(R.id.exam_countdown_date, timeOnly ?: "")
        }

        // Click to open exams page
        val clickPendingIntent = WidgetConfig.createDeepLinkPendingIntent(
            context, appWidgetId, "ysuclient://exams"
        )
        views.setOnClickPendingIntent(R.id.exam_widget_container, clickPendingIntent)

        appWidgetManager.updateAppWidget(appWidgetId, views)
    }

    private fun computeDaysRemaining(exam: WidgetExam): Long {
        val examDate = parseExamDate(exam) ?: return 0
        val now = Calendar.getInstance()
        // Set both to midnight for accurate day count
        now.set(Calendar.HOUR_OF_DAY, 0)
        now.set(Calendar.MINUTE, 0)
        now.set(Calendar.SECOND, 0)
        now.set(Calendar.MILLISECOND, 0)

        val examMidnight = examDate.clone() as Calendar
        examMidnight.set(Calendar.HOUR_OF_DAY, 0)
        examMidnight.set(Calendar.MINUTE, 0)
        examMidnight.set(Calendar.SECOND, 0)
        examMidnight.set(Calendar.MILLISECOND, 0)

        val diffMillis = examMidnight.timeInMillis - now.timeInMillis
        return TimeUnit.MILLISECONDS.toDays(diffMillis).coerceAtLeast(0)
    }

    private fun loadExams(): List<WidgetExam> {
        val prefs = context.getSharedPreferences(WidgetConfig.PREFS_NAME, Context.MODE_PRIVATE)
        val examsJson = prefs.getString(WidgetConfig.KEY_EXAMS, "[]") ?: "[]"
        return parseExams(examsJson)
    }

    private fun parseExams(json: String): List<WidgetExam> {
        return try {
            val array = JSONArray(json)
            List(array.length()) { i ->
                val obj = array.getJSONObject(i)
                WidgetExam(
                    name = obj.optString("name", ""),
                    examName = obj.optString("exam_name").takeIf { it.isNotEmpty() },
                    examDate = obj.optString("exam_date").takeIf { it.isNotEmpty() },
                    examTime = obj.optString("exam_time").takeIf { it.isNotEmpty() },
                    examLocation = obj.optString("exam_location").takeIf { it.isNotEmpty() },
                    seatNumber = obj.optString("seat_number").takeIf { it.isNotEmpty() }
                )
            }
        } catch (_: Exception) {
            emptyList()
        }
    }

    private fun filterUpcomingExams(exams: List<WidgetExam>): List<WidgetExam> {
        val now = Calendar.getInstance()
        val thirtyDaysLater = Calendar.getInstance().apply { add(Calendar.DAY_OF_MONTH, 30) }

        return exams.filter { exam ->
            val examDate = parseExamDate(exam)
            if (examDate == null) return@filter false
            // Include exams that haven't ended yet and are within 30 days
            examDate.after(now) && examDate.before(thirtyDaysLater)
        }.sortedBy { exam ->
            parseExamDate(exam)?.timeInMillis ?: Long.MAX_VALUE
        }
    }

    private fun parseExamDate(exam: WidgetExam): Calendar? {
        if (exam.examDate.isNullOrEmpty()) return null
        val cal = Calendar.getInstance()
        val parts = exam.examDate.split("-")
        if (parts.size != 3) return null
        return try {
            val year = parts[0].toInt()
            val month = parts[1].toInt() - 1
            val day = parts[2].toInt()
            cal.set(year, month, day, 23, 59, 59)
            cal
        } catch (_: Exception) {
            null
        }
    }

    /**
     * Extract time portion from exam_time string.
     * e.g. "2026-05-30 18:10-19:45(星期三)" -> "18:10-19:45"
     */
    private fun extractTimeOnly(examTime: String?): String? {
        if (examTime.isNullOrEmpty()) return null
        val regex = """\d{1,2}:\d{2}[-~]\d{1,2}:\d{2}""".toRegex()
        return regex.find(examTime)?.value
    }

    /**
     * Format exam date to short form without year.
     * e.g. "2026-05-30" -> "5.30"
     */
    private fun formatShortDate(examDate: String): String? {
        val parts = examDate.split("-")
        if (parts.size != 3) return null
        return try {
            val month = parts[1].toInt()
            val day = parts[2].toInt()
            "${month}.${day}"
        } catch (_: Exception) {
            null
        }
    }
}
