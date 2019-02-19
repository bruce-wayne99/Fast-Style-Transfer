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
			console.log(response.images);
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
	},
	runStyleTransfer: function() {
		var canvas = document.querySelector("#canvasElement");
		var img = canvas.toDataURL();
		// var data = models.base64ToArrayBuffer(img.split('data:image/png;base64,')[1]);
		// console.log(new Uint8Array(data)[0]);
		// console.log(img.split('data:image/png;base64,')[1]);
		utils.jsonRequest('POST', '/ajax/run_style_transfer', {
			'base64str': img.split('data:image/png;base64,')[1]
		},
		successCallback = function (response) {
			$.notify('Style images have been loaded','success');
			// console.log(response.iname);
			// models.displayStylizedImage(response.iname);
		},
		errorCallback = function (response) {
			$.notify('Failed to gather style images','error');			
		});
	}
}