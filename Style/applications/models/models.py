from django.db import models

class StyleImage(models.Model):
	name = models.CharField(max_length=200, null=True)
	desc = models.CharField(max_length=1000, null=True)
	ipath = models.CharField(max_length=200, null=True)
	mpath = models.CharField(max_length=200, null=True)

	def serialize(cls):
		return {
			'id': cls.id,
			'name': cls.name,
			'desc': cls.desc,
			'mpath': cls.mpath
		}