# coding=UTF-8
from django import forms
from django.forms.widgets import  DateInput, Textarea

class CourseForm(forms.Form):
    courseName = forms.CharField(max_length=50, label="课程名称")

    courseDescription = forms.CharField(label="课程介绍", widget=forms.Textarea)
    #主讲
    courseSpeaker = forms.CharField(max_length=30, label="主讲人 ")
    #课时
    courseTime = forms.IntegerField(required=False, label="课时")
    courseStartTime = forms.DateTimeField(label="开始上课日期", widget=DateInput(format="%Y-%m-%d"), required=True)
    #课程时间安排
    courseArrange = forms.CharField(max_length=100, required=False, label="课程安排")

    enrollStartTime = forms.DateTimeField(label="报名开始时间", widget=DateInput(format='%Y-%m-%d'), required=True)

    enrollEndTime = forms.DateTimeField(label="报名结束时间", widget=DateInput(format='%Y-%m-%d'), required=True)
    #允许报名人数
    maxTraineeAmount = forms.IntegerField(label="最大名额")
    courseWare = forms.FileField(required=False, label="课件")


class UpdateCourseForm(forms.Form):
    courseName = forms.CharField(max_length=50, label="课程名称")

    courseDescription = forms.CharField(label="课程介绍： ", widget=forms.Textarea)
    #主讲
    courseSpeaker = forms.CharField(max_length=30, label="主讲人 ")
    #课时
    courseTime = forms.IntegerField(required=False, label="课时")
    courseStartTime = forms.DateTimeField(label="开始上课日期", widget=DateInput(format="%Y-%m-%d"), required=True)
    courseArrange = forms.CharField(max_length=100, required=False, label="课程安排 ")

    enrollStartTime = forms.DateTimeField(label="报名开始时间", widget=DateInput(format='%Y-%m-%d'), required=True)

    enrollEndTime = forms.DateTimeField(label="报名结束时间", widget=DateInput(format='%Y-%m-%d'), required=True)
    courseWare = forms.FileField(required=False, label="课件")


class SendEmailForm(forms.Form):
    recipient_list = forms.CharField(label="收件成员：", required=True)
    subject = forms.CharField(label="邮件主题：", required=True)
    contents = forms.CharField(label="邮件内容：", widget=Textarea(attrs={"rows": '20', "cols": "40"}), required=True)
