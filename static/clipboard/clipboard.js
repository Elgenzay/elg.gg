function copy(elem) {
    elem.select();

    if (navigator.clipboard) {
        navigator.clipboard.writeText(elem.value);
    } else {
        document.execCommand("copy");
    }
}

function submit(data) {
    let url = `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}/clipboard`;

    if (getQueryParam('p')) {
        document.getElementById("submit").style.display = "none";
    }

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain'
        },
        body: data
    })
        .then(response => response.text())
        .then(data => {
            try {
                let jsonObject = JSON.parse(data);

                if (jsonObject.hasOwnProperty('image')) {
                    propValue = jsonObject.image;
                    displayImage(propValue);
                } else {
                    throw new Error();
                }
            } catch (e) {
                let elem = document.getElementById("output");
                elem.value = data;
                copy(elem);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function toggleHideOutput() {
    let elem = document.getElementById("output");

    if (elem.style.visibility === "hidden") {
        elem.style.visibility = null;
    } else {
        elem.style.visibility = "hidden";
    }
}


document.addEventListener('DOMContentLoaded', (e) => {
    let pin = getQueryParam('p');

    if (pin) {
        let inputElem = document.getElementById("input");
        inputElem.value = pin;
        inputElem.style.display = "none";
        document.getElementById("hidebutton").style.display = "none";
        document.getElementById("output").value = "Click Submit to fetch entry " + pin + ".\n\nEntry is deleted when fetched or expired.\n\nText is copied to the clipboard automatically upon retrieval.";
    }

    document.getElementById('input').addEventListener('paste', (e) => {
        let items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (let item of items) {
            if (item.kind === 'file') {
                let file = item.getAsFile();
                if (file && file.type.startsWith('image/')) {
                    fileToBase64(file, (base64String) => {
                        let obj = {
                            "image": base64String
                        };

                        submit(JSON.stringify(obj));
                    });
                } else {
                    // non-image files not supported
                }
            }
        }
    });
});

function fileToBase64(file, callback) {
    let reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = function () {
        let base64String = reader.result
            .replace('data:', '')
            .replace(/^.+,/, '');
        callback(base64String);
    };

    reader.onerror = function (error) {
        console.error('Error: ', error);
    };
}

function base64ToFile(base64String, fileName) {
    let byteString = atob(base64String);
    let arrayBuffer = new ArrayBuffer(byteString.length);
    let int8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
        int8Array[i] = byteString.charCodeAt(i);
    }

    let blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
    return new File([blob], fileName);
}

function displayImage(base64String, imageType = 'image/png') {
    let imageElement = document.createElement('img');
    imageElement.src = `data:${imageType};base64,${base64String}`;
    let imgWrapper = document.getElementById("wrapper");
    imgWrapper.innerHTML = "";
    imgWrapper.appendChild(imageElement);
}

function getQueryParam(param) {
    let urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}
