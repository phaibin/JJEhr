from tastypie.resources import ModelResource
from lesson.models import Course

class CourseModelResource(ModelResource):
    """docstring for UserModelResource"""
    class Meta:
        queryset = Course.objects.all()
        resource_name = 'course'
        