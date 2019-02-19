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
    	video.onclick= function () {
    		models.videoCapture();
    	};
    	models.getStyleImages();
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
		var video = document.querySelector("#videoElement");
        ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
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
		for(var i = 0; i < images.length; i++) {
			str += '<td><a class="list-group-item list-group-item-action">';
			str += '<img src="/static/' + images[i].ipath + '" alt="Image"/>';
			// str += models.getImageInfo(movies[i]);
			str += '</a></td>';
		}
		str += '</tr>';
		table.html(str);
		models.addOnClickHandlers($('#styleTable').find('td'), images);
	},
	addOnClickHandlers: function (imgs, images) {
		for(var i = 0; i < imgs.length; i++) {
			$(imgs[i]).data('mpath', images[i].mpath);
			$(imgs[i]).click(function () {
				models.runStyleTransfer($(this).data('mpath'));
			});
		}
	},
	runStyleTransfer: function(mpath) {
		var canvas = document.querySelector("#canvasElement");
		var img = canvas.toDataURL();
		utils.jsonRequest('POST', '/ajax/run_style_transfer', {
			'base64str': img.split('data:image/png;base64,')[1],
			'mpath': mpath
		},
		successCallback = function (response) {
			$.notify('Style images have been loaded','success');
			models.displayStylizedImage(response.iname);
		},
		errorCallback = function (response) {
			$.notify('Failed to gather style images','error');			
		});
	},
	displayStylizedImage(iname) {
		table = $('#outTable');
		table.html("");
		str = '<tr style="align:center">';
		str += '<td><a class="list-group-item list-group-item-action">';
		str += '<img src="/static/' + iname + '" alt="Image"/>';
		str += '</a></td></tr>';
		table.html(str);
	}
}