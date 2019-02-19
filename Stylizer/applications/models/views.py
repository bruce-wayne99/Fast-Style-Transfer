from django.shortcuts import render
from applications.models.models import StyleImage
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from style.settings import CONTENT_IMAGES, STYLE_IMAGES, OUT_IMAGES, MODEL_PATH, SRC_PATH
import json
import os
import base64

def index(request):
	return render(request, 'models/index.html', {})

def ajax_get_style_images(request):
	images = StyleImage.objects.all()
	images = [image.serialize() for image in images]
	return HttpResponse(json.dumps({
			'images': images
		}), content_type="application/json", status=200)

@csrf_exempt
def ajax_run_style_transfer(request):
	# print(request.POST)
	img_data = json.loads(request.body)['base64str']
	fh = open(CONTENT_IMAGES + 'content.png', 'wb')
	fh.write(img_data.decode('base64'))
	fh.close()
	content_img = CONTENT_IMAGES+'content.png'
	style_img = STYLE_IMAGES + 'candy.jpg'
	output_img = OUT_IMAGES +'stylized.jpg'
	model_path = MODEL_PATH + 'candy.pth'
	command_run_style_transfer(content_img=content_img, style_img=style_img, output_img=output_img, model_path=model_path)
	return HttpResponse(json.dumps({
			'iname': 'stylized.jpg'
		}), content_type="application/json", status=200)

def command_run_style_transfer(content_img, style_img, output_img, model_path):
	command = ""
	command += " python " + SRC_PATH + "neural_style.py eval"
	command += " --content-image " + content_img
	command += " --model " + model_path
	command += " --output-image " + output_img
	command += " --cuda 0"
	# print(command)
	os.system(command)
	return