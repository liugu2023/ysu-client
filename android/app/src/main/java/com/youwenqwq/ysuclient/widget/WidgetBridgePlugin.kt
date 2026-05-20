package com.youwenqwq.ysuclient.widget

import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(name = "WidgetBridge")
class WidgetBridgePlugin : Plugin() {

    @PluginMethod
    fun syncSchedule(call: PluginCall) {
        val coursesJson = call.getString("coursesJson", "[]")
        val currentWeekJson = call.getString("currentWeekJson", "")

        val prefs = context.getSharedPreferences(WidgetConfig.PREFS_NAME, android.content.Context.MODE_PRIVATE)
        prefs.edit().apply {
            putString(WidgetConfig.KEY_COURSES, coursesJson)
            putString(WidgetConfig.KEY_CURRENT_WEEK, currentWeekJson)
            apply()
        }

        // Trigger schedule widget update
        val scheduleHelper = ScheduleWidgetHelper(context)
        scheduleHelper.updateAllWidgets()

        call.resolve()
    }

    @PluginMethod
    fun syncExams(call: PluginCall) {
        val examsJson = call.getString("examsJson", "[]")

        val prefs = context.getSharedPreferences(WidgetConfig.PREFS_NAME, android.content.Context.MODE_PRIVATE)
        prefs.edit().apply {
            putString(WidgetConfig.KEY_EXAMS, examsJson)
            apply()
        }

        // Trigger exam widget update
        val examHelper = ExamWidgetHelper(context)
        examHelper.updateAllWidgets()

        call.resolve()
    }
}
