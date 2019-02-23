var utils = {
	jsonRequest: function (method, url, data, successCallback, errorCallback) {
        $.ajax({
            headers: {
                'Accept': 'application/json'
            },
            method: method,
            data: method == 'GET' ? data : JSON.stringify(data),
            url: url,
            success: successCallback,
            error: errorCallback
        });
    }
};

var models = {
	init: function () {
		var video = document.querySelector("#videoElement");
		if (navigator.mediaDevices.getUserMedia) {       
    		navigator.mediaDevices.getUserMedia({video: true}).then(function(stream) {
    			video.srcObject = stream;
  			});
    	}
    	$('#captureButton').click(function () {
    		models.videoCapture();
    		$('#captureTable1').removeClass('hidden');
    		$(this).addClass('hidden');
    	});
    	$('#captureAgain').click(function () {
    		$('#captureButton').removeClass('hidden');
    		$('#captureTable1').addClass('hidden');
    		$('#videoElement').removeClass('hidden');
        	$('#canvasElement2').addClass('hidden');
    	});
    	$('#nextButton1').click(function () {
    		$('#videoTable').addClass('hidden');
    		$('#styleSelectionTable').removeClass('hidden');
    		$('#styleSelectionTable2').removeClass('hidden');
    	});
    	$('#backButton1').click(function () {
    		$('#videoTable').removeClass('hidden');
    		$('#styleSelectionTable').addClass('hidden');
    		$('#styleSelectionTable2').addClass('hidden');
    	});
    	$('#applyStyleTransfer').click(function () {
    		style_images = models.getSelectedImages();
    		if(style_images.length > 3) {
    			$.notify('You can select atmost 3 style images.','error');
    			return;
    		}
    		if(style_images.length < 1) {
    			$.notify('Select atleast 1 style image.','error');
    			return;
    		}
    		models.runStyleTransfer(style_images);
    	});
    	// $('#backButton2').click(function () {
    	// 	$('#styleSelectionTable').removeClass('hidden');
    	// 	$('#styleSelectionTable2').removeClass('hidden');
    	// 	$('#outTable').addClass('hidden');
    	// 	$('#outTable2').addClass('hidden');
    	// });
    	$('#captureNewImage').click(function () {
    		$('#outTable').addClass('hidden');
    		$('#outTable2').addClass('hidden');
    		$('#videoTable').removeClass('hidden');
    	});
    	$('#emailSubmitBtn').click(function() {
    		if(models.checkValidEmail($('#emailAdrr').val())) {
    			models.sendEmail($('#emailAdrr').val());
    		}
    		else {
    			$.notify('Please enter valid email address');
    		}
    	});
    	models.getStyleImages();
    	models.populateVisitorCnt();
	},
	getSelectedImages: function () {
		select_ele = $('.selected');
		style_images = [];
		for(var i=0;i<select_ele.length; i++) {
			style_images.push($(select_ele[i]).data("mpath"));
		}
		return style_images;
	},
	videoStart: function () {
		models.init();
	},
	videoStop: function () {
		var video = document.querySelector("#videoElement");
		video.srcObject.getTracks()[0].stop();
	},
	videoCapture: function () {
		var canvas = document.querySelector("#canvasElement");
		var canvas2 = document.querySelector("#canvasElement2");
		var video = document.querySelector("#videoElement");
        ctx = canvas.getContext('2d');
        ctx2 = canvas2.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx2.drawImage(video, 0, 0, canvas2.width, canvas2.height);
        video.classList.add('hidden');
        canvas2.classList.remove('hidden');
	},
	getStyleImages: function () {
		utils.jsonRequest('GET', '/ajax/style_images', {
		},
		successCallback = function (response) {
			$.notify('Style images have been loaded','success');
			// console.log(response.images);
			models.displayStyleImages(response.images);
		},
		errorCallback = function (response) {
			$.notify('Failed to gather style images','error');			
		});
	},
	displayStyleImages: function(images) {
		table = $('#styleTable');
		str = '<tr style="align:center">';
		str += '<th>Click on the style images to select them</th>';
		str += '<th>You can select a maximum of 3 styles</th>';
		str += '</tr>';
		str += '<tr style="align:center">';
		var cnt = 0;
		for(var i = 0; i < images.length; i++) {
			str += '<td><a class="list-group-item list-group-item-action">';
			str += '<img src="/static/' + images[i].ipath + '" alt="Image"/>';
			// str += models.getImageInfo(movies[i]);
			str += '</a></td>';
			if(cnt % 2 == 1) {
				str += '</tr>';
				str += '<tr style="align:center">';
			}
			cnt += 1;
		}
		str += '</tr>';
		table.html(str);
		models.addOnClickHandlers($('#styleTable').find('td'), images);
	},
	addOnClickHandlers: function (imgs, images) {
		for(var i = 0; i < imgs.length; i++) {
			$(imgs[i]).find('img').data('mpath', images[i].mpath);
			$(imgs[i]).click(function () {
				// models.runStyleTransfer($(this).data('mpath'));
				if($(this).find('img').hasClass('selected')) {
					$(this).find('img').removeClass('selected');
				}
				else {
					$(this).find('img').addClass('selected');
				}
			});
		}
	},
	runStyleTransfer: function(mpaths) {
		var canvas = document.querySelector("#canvasElement");
		var img = canvas.toDataURL();
		utils.jsonRequest('POST', '/ajax/run_style_transfer', {
			'base64str': img.split('data:image/png;base64,')[1],
			'mpath': mpaths
		},
		successCallback = function (response) {
			$.notify('Style images have been loaded','success');
			models.displayStylizedImage(response.inames);
			$('#styleSelectionTable').addClass('hidden');
    		$('#styleSelectionTable2').addClass('hidden');
    		$('#outTable').removeClass('hidden');
    		$('#outTable2').removeClass('hidden');
    		$('.selected').removeClass('selected');
		},
		errorCallback = function (response) {
			$.notify('Failed to gather style images','error');			
		});
	},
	displayStylizedImage: function(inames) {
		table = $('#outTable');
		table.html("");
		str = '<tr style="align:center">';
		for(var i = 0; i < inames.length; i++) {
			str += '<td><a class="list-group-item list-group-item-action">';
			str += '<img src="/static/' + inames[i] + '" alt="Image"/>';
			str += '</a></td>';
		}
		str += '</tr>';
		table.html(str);
	},
	sendEmail: function(email) {
		var imgs = $('#outTable').find('img');
		var img_names = [];
		for(var i = 0; i < imgs.length; i++) {
			img_names.push(imgs[i].src.split('/')[imgs[i].src.split('/').length - 1]);
		}
		console.log(img_names);
		utils.jsonRequest('GET', '/ajax/send_email', {
			'email': email,
			'img_names': img_names
		},
		successCallback = function(response) {
			$('Thank you for your time', 'success');
    		setTimeout(models.resetPage, 1000);
		},
		errorCallback = function (response) {
			$('Failed to send email', 'error');
			setTimeout(models.resetPage, 1000);
		});
	},
	resetPage: function() {
		$('#outTable').addClass('hidden');
		$('#outTable2').addClass('hidden');
		$('#videoTable').removeClass('hidden');
		$('#captureAgain').click();
		models.populateVisitorCnt();
	},
	checkValidEmail: function(email) {
		if(email != '') {
			return true;
		}
		return false;
	},
	populateVisitorCnt: function() {
		utils.jsonRequest('GET', '/ajax/get_visitor_cnt', {
		},
		successCallback = function(response) {
			$('#visitorCnt').html(response.cnt);
		},
		errorCallback = function(response) {
			$('#visitorCnt').html(0);
		});
	}
}