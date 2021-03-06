#-*- coding: UTF-8 -*-
from django.db import models

class EventType(models.Model):
    type_name = models.CharField(max_length=30, verbose_name="活动类型名称")
    type_image = models.ImageField(verbose_name="活动类型图片", blank=True, upload_to="event/event_image_%Y_%m_%d_%M_%S")
    create_date = models.DateTimeField(auto_now=True)

    def __unicode__(self):
        return self.type_name