
#-*- coding: UTF-8 -*-

from django.http import Http404
from tastypie.resources import ModelResource
from lesson.models import Course, Enroll
from tastypie.paginator import Paginator
# from tastypie.authentication import Authentication, BasicAuthentication
from tastypie.authorization import Authorization
from tastypie.utils import trailing_slash
from django.conf.urls.defaults import patterns, url, include
import datetime
from django.core.mail import send_mail
import settings

class CourseModelResource(ModelResource):
    """docstring for UserModelResource"""
    class Meta:
        ordering = ['id','createDate',]
        queryset = Course.objects.all()
        resource_name = 'course'
        paginator_class = Paginator
        # authentication = Authentication()
        authorization = Authorization()
        always_return_data = True
        limit = 5


    def friends(request, queryset):
        return {}
        
    def prepend_urls(self):
        """
        curl -H "Content-Type: application/json" -X POST --data 'email=phaibin@gmail.com;course_id=1' http://localhost:8000/api/v1/course/book/
        """
        return [url(r"^(?P<resource_name>%s)/book%s$" % (self._meta.resource_name, trailing_slash()), self.wrap_view('book'), name="api_get_search"),]
        
    def book(self, request, **kwargs):
        code = 0
        message = u'成功';
        if request.method == 'POST':
            _email = request.POST['email']
            _course = Course.objects.get(id=request.POST['course_id'])
            if _course.enrollStartTime > datetime.datetime.now() or _course.enrollEndTime < datetime.datetime.now():
                code = 1
                message = u'时间不对'
            elif Enroll.objects.filter(email=_email, course=_course).count() > 0:
                code = 1
                message = u'你已经订阅过了'
            else:
                enroll = Enroll(email=_email, course=_course)
                if Enroll.objects.filter(isWaitingList=False).count() > _course.maxTraineeAmount:
                    enroll.isWaitingList = True
                enroll.save()
                send_mail(subject=settings.ENROLL_EMAIL_SUBJECT.format(name=_course.courseName),
                    message=settings.ENROLL_EMAIL_CONTENT.format(name=_course.courseName),
                    from_email=settings.ENROLL_EMAIL_FROM,
                    recipient_list=[_email],
                    fail_silently=False)
            return self.create_response(request, {'meta':{'code':code, 'message':message}})
