from django.conf.urls.defaults import patterns, url, include

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
from django.contrib.auth.decorators import login_required
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.views.generic.list import ListView
from JJEhr.survey.models import Survey
from lesson.api import CourseModelResource

urlpatterns = patterns('',

    url(r'^$', 'lesson.views.index'),
    url(r'^book/$', 'lesson.views.book_course'),
    url(r'^course/index.html', 'lesson.views.index'),
    url(r'^backoffice/login', 'django.contrib.auth.views.login', {'template_name': 'backoffice/login.html'}),

    url(r'^backoffice/course/(?P<courseId>\d+)$', 'backoffice.views.courseView'),
    url(r'^backoffice/course/delete/(?P<courseId>\d+)$', 'backoffice.views.delete_course'),
    url(r'^backoffice/course/add', 'backoffice.views.addCourse'),
    url(r'^backoffice/notification-email/send', 'backoffice.views.send_notification_email'),

    url(r'^api/', include(CourseModelResource().urls)),
)

urlpatterns += staticfiles_urlpatterns()

urlpatterns += patterns(r'backoffice',
    #    url(r'^backoffice/export', r'views.export_notification_list'),
    url(r'^backoffice/course/email', r'views.to_send_email_page'),
    url(r'^backoffice/index.html', r'views.displayCourseList'),
)

urlpatterns += patterns(r'event',
    url(r'^event/eventtype/add', r'views.event_type_add'),
    url(r'^event/eventtype/eventformcontent', r'views.ajax_content_html'),
    url(r'^event/eventtype/all', r'views.get_all_event_type'),
    url(r'^event/eventtype/delete/(?P<event_type_id>\d+)$', r'views.event_type_delete'),
)

urlpatterns += patterns(r'survey',
    url(r'backoffice/survey/create', r'views.create_survey'),
    url(r'backoffice/survey/list', login_required(ListView.as_view(model=Survey, template_name=r'backoffice/survey_list.html'))),
    url(r'^backoffice/survey/edit/(?P<surveyId>\d+)', r'views.edit_survey'),
    url(r'^backoffice/survey/result/(?P<surveyId>\d+)', r'views.generate_excel'),
    url(r'^backoffice/survey/addSurveyItem', r'views.create_survey_item'),
    url(r'^backoffice/survey/delete/(?P<surveyId>\d+)$', r'views.delete_survey_item'),
    url(r'^backoffice/survey/remove/(?P<surveyId>\d+)$', r'views.delete_survey'),
    url(r'^backoffice/survey/complete/(?P<surveyId>\d+)$', r'views.complete_survey'),
    url(r'^backoffice/survey/end/(?P<surveyId>\d+)$', r'views.end_survey'),
    url(r'^survey/start/(?P<token>[A-Za-z0-9]+)', r'views.user_start_survey'),
    url(r'^survey/start/(?P<token>[A-Za-z0-9]+)/(?P<page>\d+)$', r'views.user_start_survey'),
    url(r'^survey/login$', r'views.survey_login'),
    url(r'^survey/addResult', r'views.add_survey_result'),
)

urlpatterns += patterns('django.views.generic.simple',
    (r'^survey/thanks','direct_to_template', {'template':'www/thanks_page.html'}),
)
