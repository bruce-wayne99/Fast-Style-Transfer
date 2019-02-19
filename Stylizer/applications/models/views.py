from django.shortcuts import render
from applications.models.models import StyleImage
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from style.settings import CONTENT_IMAGES, STYLE_IMAGES, OUT_IMAGES, MODEL_PATH, SRC_PATH
import json
import os
import base64
import cv2
import time

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
	st_time = time.time()
	img_data = json.loads(request.body)['base64str']
	fh = open(CONTENT_IMAGES + 'content.png', 'wb')
	fh.write(img_data.decode('base64'))
	fh.close()
	img = cv2.imread(CONTENT_IMAGES + 'content.png')
	img = cv2.resize(img, (1080,1080))
	cv2.imwrite(CONTENT_IMAGES + 'content.jpg', img)
	content_img = CONTENT_IMAGES+'content.jpg'
	style_img = STYLE_IMAGES + 'candy.jpg'
	output_img = OUT_IMAGES +'stylized.jpg'
	model_path = MODEL_PATH + 'candy.pth'
	command_run_style_transfer(content_img=content_img, style_img=style_img, output_img=output_img, model_path=model_path)
	img = cv2.imread(output_img)
	img = cv2.resize(img, (800, 600))
	cv2.imwrite(output_img, img)
	print(time.time()-st_time, 'Total time for style transfer')
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
	os.system(command)
	return