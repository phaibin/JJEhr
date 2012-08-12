#-*- coding: UTF-8 -*-
from datetime import datetime
from django.contrib.auth import authenticate, login

from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.core.urlresolvers import reverse
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response
from django.views.decorators.http import require_http_methods
import time
from xlwt.Workbook import Workbook
from JJEhr import settings
from JJEhr.survey.models import Survey, StaffProfile, SurveyItem, SurveyItemAnswer, SurveyLog, SurveyResult
import md5

@require_http_methods(["POST"])
@login_required(login_url='/backoffice/login')
def create_survey(request):
    survey = Survey(survey_name=request.POST["survey_name"], survey_target=request.POST["survey_target"])
    if survey.survey_target == "ALL":
        querySet = StaffProfile.objects.all()
    else:
        querySet = StaffProfile.objects.filter(division=survey.survey_target)
    survey.total_employee_number = querySet.count()
    survey.save()
    for profile in querySet:
        user = profile.user
        timestack = time.mktime(datetime.now().timetuple())
        m = md5.new()
        m.update(user.email)
        m.update(str(timestack))
        m.digest()
        SurveyLog.objects.create(survey=survey,email=user.email,user=user,token=m.hexdigest())
    result = u'创建问卷成功'
    return HttpResponse(result)


@require_http_methods(["GET"])
@login_required(login_url='/backoffice/login')
def edit_survey(request, surveyId, pageNum):
    survey = Survey.objects.get(id=surveyId)
    surveyItemCollection = SurveyItem.objects.filter(survey=survey,page=pageNum)
    for surveyItem in surveyItemCollection:
        surveyItem.answers = SurveyItemAnswer.objects.filter(survey_item=surveyItem)
        if surveyItem.item_type == 'METRIX' and len(surveyItem.answers) > 0 and surveyItem.answers[0].question_value:
            surveyItem.item_values = surveyItem.answers[0].question_value.split("\n")
    return render_to_response("backoffice/survey_edit.html", {"survey": survey, "pageNum": pageNum,"surveyItemCollection":surveyItemCollection})


@require_http_methods(["GET"])
@login_required(login_url='/backoffice/login')
def delete_page(request, surveyId):
    survey = Survey.objects.get(id=surveyId)
    surveyItemCollection = SurveyItem.objects.filter(survey=survey,page=survey.total_page)
    for surveyItem in surveyItemCollection:
        SurveyItemAnswer.objects.filter(survey_item=surveyItem).delete()
    surveyItemCollection.delete()
    if survey.total_page > 1:
        survey.total_page -= 1
        survey.save()
    return HttpResponseRedirect("/backoffice/survey/edit/"+surveyId+"/"+str(1))


@require_http_methods(["POST"])
@login_required(login_url='/backoffice/login')
def create_survey_item(request):
    isRequired = request.POST["isRequired"]

    if isRequired=='false':
        isRequired=False
    else:
        isRequired=True

    surveyItemText = request.POST["surveyItemText"]
    survey_id = request.POST["survey_id"]
    page_num = request.POST["page_num"]
    surveyItemType = request.POST["surveyItemType"]
    survey = Survey.objects.get(id=survey_id)

    if surveyItemType == 'MULTIPLE_CHOICE' or surveyItemType == 'SINGLE_CHOICE' or surveyItemType == 'MULTIPLE_TEXT' or surveyItemType == "METRIX":
        other_answer = request.POST["otherAnswer"]
        if other_answer=='false':
            other_answer=False
        else:
            other_answer=True
        surveyItemAnswer = request.POST["surveyItemAnswer"]
        survey_item = SurveyItem.objects.create(item_type=surveyItemType,item_name=surveyItemText,is_required=isRequired,survey=survey,page=page_num,other_answer=other_answer)
        answerCollection = surveyItemAnswer.split("\n")

        for idx,answer in enumerate(answerCollection):
            if request.POST.get("surveyItemAnswerValue"):
                raw_answer_value = request.POST["surveyItemAnswerValue"]
                SurveyItemAnswer.objects.create(question_text=answer,question_value=raw_answer_value,question_sequence=idx,survey_item=survey_item)
            else:
                SurveyItemAnswer.objects.create(question_text=answer,question_value=idx+1,question_sequence=idx,survey_item=survey_item)
    else:
        SurveyItem.objects.create(item_type=surveyItemType,item_name=surveyItemText,is_required=isRequired,survey=survey,page=page_num)
    return HttpResponse("创建成功")

@require_http_methods(["POST"])
@login_required(login_url='/backoffice/login')
def add_page(request, surveyId):
    survey = Survey.objects.get(id=surveyId)
    try:
        if(survey):
            survey.total_page += 1;
            survey.save()
            result = u'添加页面成功'
        else:
            result = u'添加页面失败'
    except Exception,e:
        result = u'添加页面失败'
    return HttpResponse(result)

@require_http_methods(["POST"])
@login_required(login_url='/backoffice/login')
def delete_survey_item(request,surveyId=0):
    if surveyId == 0:
        return  HttpResponse(u"参数错误,请重新输入")
    try:
        answerCollection = SurveyItemAnswer.objects.filter(survey_item=surveyId)
        if len(answerCollection) > 0:
            answerCollection.delete()
        SurveyItem.objects.get(id=surveyId).delete()
    except Exception,e:
        return  HttpResponse(u"系统异常请重新尝试")
    return  HttpResponse(u"操作成功")


@require_http_methods(["GET"])
@login_required(login_url='/backoffice/login')
def complete_survey(request,surveyId):
    survey = Survey.objects.get(id=surveyId)
    survey.survey_status= 'FINISH'
    survey.save()
    return HttpResponseRedirect("/backoffice/survey/list")

@require_http_methods(["GET"])
@login_required(login_url='/backoffice/login')
def end_survey(request,surveyId):
    survey = Survey.objects.get(id=surveyId)

    surveyLogCollection = SurveyLog.objects.filter(survey=survey)
    for surveyLog in surveyLogCollection:
        try:
#            send_mail(subject=request.POST["email_subject"],
#                message=request.POST["email_message"],
#                from_email=settings.ENROLL_EMAIL_FROM,
#                recipient_list=[surveyLog.email],
#                fail_silently=False)
            surveyLog.send_email = True
            surveyLog.save()
        except Exception:
            pass
    survey.survey_status= 'CONTINUE'
    survey.save()
    return HttpResponseRedirect("/backoffice/survey/list")

@require_http_methods(["GET"])
def user_start_survey(request,token,page=1):
    if request.session.get("_auth_user_id",False):
        user = User.objects.get(id=request.session.get("_auth_user_id"))
        try:
            surveyLog = SurveyLog.objects.get(token=token,user=user)
        except Exception:
            return render_to_response("www/survey_index.html",{"authenticated":"false","incorrect_user":"true","token":token})
    else:
        return render_to_response("www/survey_index.html",{"authenticated":"false","token":token})
    if surveyLog.complete == True:
        return render_to_response("www/thanks_page.html")

    surveyItemCollection = SurveyItem.objects.filter(survey=surveyLog.survey,page=page)
    for surveyItem in surveyItemCollection:
        surveyItemAnswerCollection = SurveyItemAnswer.objects.filter(survey_item = surveyItem)
        surveyItem.answers = surveyItemAnswerCollection
        if surveyItem.item_type == 'METRIX' and surveyItem.answers[0].question_value:
            surveyItem.item_values = surveyItem.answers[0].question_value.split("\n")
    return render_to_response("www/survey_index.html",{"survey_item_collection":surveyItemCollection,"survey":surveyLog.survey,"token":token,"userId":surveyLog.user.id})

#@require_http_methods(["POST"])
def survey_login(request):
    if request.POST:
        email = request.POST["email"]
        userCollection = User.objects.filter(email = email)
        user=userCollection[0]
        token = request.POST["token"]
        if user is not None:
            try:
                login(request,user)
            except Exception,e:
                pass
            return HttpResponseRedirect(reverse(viewname=user_start_survey,args=[token]))
        else:
            return render_to_response("www/survey_index.html",{"authenticated":"false","login_error":"true","token":token})


@require_http_methods(["POST"])
def add_survey_result(request):
    userId = request.POST["userId"]
    surveyId = request.POST["surveyId"]
    survey = Survey.objects.get(id=surveyId)
    user = User.objects.get(id=userId)
    surveyItemCollection = SurveyItem.objects.filter(survey=surveyId)

    for surveyItem in surveyItemCollection:
        if surveyItem.item_type == 'MULTIPLE_CHOICE':
            if not surveyItem.is_required and len(request.POST["surveyItem_"+str(surveyItem.id)+"_answer_value"]) < 1:
                continue
            answerValueList = request.POST["surveyItem_"+str(surveyItem.id)+"_answer_value"].split("&")
            for answerValue in answerValueList:
                SurveyResult.objects.create(survey_user=user,survey=survey,survey_result_type="STANDARD",survey_item_answer_value=answerValue,survey_item=surveyItem)
            if request.POST["surveyItem_"+str(surveyItem.id)+"_has_option"] == 'true':
                answerValue = "surveyItem_"+str(surveyItem.id)+"_option_answer_value"
                SurveyResult.objects.create(survey_user=user,survey=survey,survey_result_type="OTHER",survey_item_answer_value=answerValue,survey_item=surveyItem)

        elif surveyItem.item_type == 'SINGLE_CHOICE':
            if not surveyItem.is_required and len(request.POST["surveyItem_"+str(surveyItem.id)+"_answer_type"]) < 1:
                continue
            answerType = request.POST["surveyItem_" + str(surveyItem.id) + "_answer_type"]
            answerValue = request.POST["surveyItem_" + str(surveyItem.id) + "_answer_value"]
            SurveyResult.objects.create(survey_user=user,survey=survey,survey_result_type=answerType,survey_item_answer_value=answerValue,survey_item=surveyItem)

        elif surveyItem.item_type == 'TEXT' or surveyItem.item_type == 'TEXT_AREA':
            if not surveyItem.is_required and len(request.POST["surveyItem_"+str(surveyItem.id)+"_answer_value"]) < 1:
                continue
            answerValue = request.POST["surveyItem_"+str(surveyItem.id)+"_answer_value"]
            SurveyResult.objects.create(survey_user=user,survey=survey,survey_result_type="OTHER",survey_item_answer_value=answerValue,survey_item=surveyItem)
        elif surveyItem.item_type == 'MULTIPLE_TEXT' or surveyItem.item_type == 'METRIX':
            if not surveyItem.is_required and len(request.POST["surveyItem_"+str(surveyItem.id)+"_answer_id_collection"]) < 1:
                continue
            answerIdCollection = request.POST["surveyItem_"+str(surveyItem.id)+"_answer_id_collection"].split("&")
            for answerId in answerIdCollection:
                answerValue = request.POST["surveyItem_"+str(surveyItem.id)+"_answer_"+answerId+"_value"]
                surveyItemAnswer = SurveyItemAnswer.objects.get(id=answerId)
                SurveyResult.objects.create(survey_user=user,survey=survey,survey_result_type="OTHER",
                    survey_item_answer_value=answerValue,survey_item=surveyItem,survey_item_answer_item=surveyItemAnswer)
    survey_log=SurveyLog.objects.get(user=user,survey=survey)
    survey_log.complete=True
    survey_log.complete_date=datetime.now()
    survey_log.save()
    survey.finish_survey_employee_number+=1
    if survey.total_employee_number == survey.finish_survey_employee_number:
        survey.survey_status = 'DONE'
    survey.save()
    return render_to_response("www/thanks_page.html")


@require_http_methods(["POST"])
def generate_excel(request,surveyId):
    survey = Survey.objects.get(id=surveyId)
    surveyItemCollection = SurveyItem.objects.filter(survey=survey)
    wb = Workbook()
    for idx,surveyItem in enumerate(surveyItemCollection):
        work_sheet = wb.add_sheet(survey.survey_name+str(idx))
        if surveyItem.item_type == 'SINGLE_CHOICE':
            surveyAnswerCollection = SurveyItemAnswer.objects.filter(surveyItem=surveyItem)
            surveyResultCollection = SurveyResult.objects.filter(survey=survey,surveyItem=surveyItem)

