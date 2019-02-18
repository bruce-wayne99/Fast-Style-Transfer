from django.conf.urls import include, url
from django.contrib import admin

urlpatterns = [
    url(r'^', include('applications.models.urls')),
    url(r'^admin/', admin.site.urls),
]