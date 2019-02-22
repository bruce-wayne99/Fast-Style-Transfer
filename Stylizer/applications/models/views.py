from django.shortcuts import render
from applications.models.models import StyleImage, VisitorCnt
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
	model_names = json.loads(request.body)['mpath']
	fh = open(CONTENT_IMAGES + 'content.png', 'wb')
	fh.write(img_data.decode('base64'))
	fh.close()
	img = cv2.imread(CONTENT_IMAGES + 'content.png')
	img = cv2.resize(img, (1080,1080))
	cv2.imwrite(CONTENT_IMAGES + 'content.jpg', img)
	content_img = CONTENT_IMAGES+'content.jpg'
	output_names = []
	for model_name in model_names:
		# output_name = model_name.split('.')[0] + '_' + ''.join(str(time.time()).split('.')) + '.jpg'
		output_name = model_name.split('.')[0] + '_' + str(len(VisitorCnt.objects.all())) + '.jpg'
		# output_name = 'stylized' + '.jpg'
		output_img = OUT_IMAGES + output_name
		model_path = MODEL_PATH + model_name
		command_run_style_transfer(content_img=content_img, output_img=output_img, model_path=model_path)
		img = cv2.imread(output_img)
		img = cv2.resize(img, (800, 600))
		cv2.imwrite(output_img, img)
		output_names.append(output_name)
	print(time.time()-st_time, 'Total time for style transfer')
	return HttpResponse(json.dumps({
			'inames': output_names
		}), content_type="application/json", status=200)

def command_run_style_transfer(content_img, output_img, model_path):
	command = ""
	command += " python " + SRC_PATH + "neural_style.py eval"
	command += " --content-image " + content_img
	command += " --model " + model_path
	command += " --output-image " + output_img
	command += " --cuda 0"
	os.system(command)
	return

def ajax_send_email(request):
	email = request.GET['email']
	visitor = VisitorCnt(email=email)
	visitor.save()
	img_names = request.GET.getlist('img_names[]')
	for img_name in img_names:
		command = 'mv '
		command += OUT_IMAGES + img_name + ' '
		command += OUT_IMAGES + email + '_' + str(len(VisitorCnt.objects.all())) + '_' + img_name.split('_')[0] + '.jpg'
		os.system(command)
	return HttpResponse(json.dumps({
		}), content_type="application/json", status=200)

def ajax_visitor_cnt(request):
	return HttpResponse(json.dumps({
			'cnt': len(VisitorCnt.objects.all())
		}), content_type="application/json", status=200)