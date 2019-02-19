from django.conf.urls import url

from . import views

urlpatterns = [
	url(r'^ajax/style_images', views.ajax_get_style_images, name='Ajax request for getting style images'),
	url(r'^ajax/run_style_transfer', views.ajax_run_style_transfer, name='Ajax request running style transfer'),
    url(r'^', views.index, name='Index page')

]