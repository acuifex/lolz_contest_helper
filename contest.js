function request_answer(thread, question, letter) {
    const XHR = new XMLHttpRequest(),
        params = new URLSearchParams();

    params.append("id", thread);
    params.append("q", question);
    if (letter) {
        params.append("l", letter);
    }
    XHR.responseType = 'json';

    XHR.onload = function (event) {
        console.log(XHR)
        if (XHR.readyState === XHR.DONE) {
            let newlabel = document.createElement("p");
            if (XHR.status === 200) {
                if (XHR.response["status"] === -1) { // this is a mess. remake this stuff
                    already_got_answer = 0;
                    newlabel.innerHTML = "Сервер не имеет ответа на такой вопрос."
                } else {
                    newlabel.innerHTML = JSON.stringify(XHR.response)
                    if (XHR.response["status"] === 1) {
                        already_got_answer = 0;
                        captcha.children.CaptchaQuestionAnswer.value = XHR.response["answer"]
                        newlabel.innerHTML = newlabel.innerHTML + "<br>Этот ответ был найден с помощью вопроса. Он может быть не верный"
                        document.getElementsByClassName("LztContest--Participate")[0].style["background-color"] = "red"
                    } else if (XHR.response["status"] === 0) {
                        captcha.children.CaptchaQuestionAnswer.value = XHR.response["answer"]
                    } else {
                        newlabel.innerHTML = newlabel.innerHTML + "<br>Неизвестный статус ответа."
                    }
                }

            } else {
                newlabel.innerHTML = "Произошла какая то проблема. Больше информации в консоле"
            }
            captcha.appendChild(newlabel)
        }
    };

    XHR.addEventListener('error', function (event) {
        alert('Ошибка соеденения с сервером. Больше информации в консоле');
        console.log(event)
    });

    XHR.open('GET', 'https://answers.acuifex.ru/query.php?' + params.toString());
    XHR.send();
}

function createButton(text, callback) {
    let btnname = document.createElement("a");
    btnname.className = "button"
    btnname.innerHTML = text
    btnname.onclick = callback
    captcha.appendChild(btnname)
}

function onCaptcha(captcha) {
    let question = captcha.getElementsByClassName("ddText")[0].children[0].textContent
    let hint = captcha.children.CaptchaQuestionAnswer.placeholder
    let hint_letter = null
    if (hint) {
        hint_letter = hint.match("Начинается с символа '(.)'")[1]
    }

    let newlabel = document.createElement("p");
    newlabel.innerHTML = hint
    captcha.appendChild(newlabel)

    createButton("Имя", function () {
        captcha.children.CaptchaQuestionAnswer.value = document.getElementById("messageList")
            .getElementsByClassName("message  firstPost  ")[0].dataset.author
        return false;
    })
	createButton("Math", function () {
		let calc = eval(question.toLowerCase().replace("x", "*").replace("\\", "/").replace("--", "-").replace("умножить на", "*").replace("умножить", "*").replace("поделить", "/").replace("поделить на", "/").replace("плюс", "+").replace("минус", "-").replace(/[^-()\d/*+.]/g, ''));
		captcha.children.CaptchaQuestionAnswer.value = (calc === undefined) ? "" : calc;
        return false;
    })
    createButton("Первое слово", function () {
        title = document.getElementsByClassName("titleBar")[0].children[0].lastChild.textContent.trim()
        n = title.split(" ");
        captcha.children.CaptchaQuestionAnswer.value = n[0]
        return false;
    })
    createButton("Последнее слово", function () {
        title = document.getElementsByClassName("titleBar")[0].children[0].lastChild.textContent.trim()
        n = title.split(" ");
        captcha.children.CaptchaQuestionAnswer.value = n[n.length - 1];
        return false;
    })
    createButton("Приз сумма", function () {
        text = document.getElementsByClassName("contestThreadBlock")[0].children[3].children[2].innerText
        captcha.children.CaptchaQuestionAnswer.value = text.match("Деньги \\(([0-9]+) ₽\\)")[1]
        return false;
    })

    let threadid = window.location.pathname.match("/threads/([0-9]+)/")[1]

    browser.runtime.onMessage.addListener(request => {
        console.log("Message from the background script:");
        console.log(request.request);
        console.log(request.response);
        console.log(already_got_answer);
        if (!already_got_answer
            && request.response._redirectStatus === "ok"
            // TODO: remove this check? this might fail when you have a different language
            && request.response._redirectMessage === "Успешно! Вы участвуете розыгрыше."
            // check that the request is for the same page as the script
            && request.url.match("/threads/([0-9]+)/participate")[1] == threadid
            && request.request.requestBody.formData.captcha_type[0] === "AnswerCaptcha") {
            const XHR = new XMLHttpRequest(),
                params = new URLSearchParams();

            params.append("id", threadid);
            params.append("q", question);
            if (hint_letter) {
                params.append("l", hint_letter);
            }
            params.append("a", request.request.requestBody.formData.captcha_question_answer[0]);
            XHR.responseType = 'json';

            XHR.onload = function (event) {
                console.log(XHR)
                if (XHR.readyState === XHR.DONE) {
                    if (XHR.status === 200) {
                        console.log("ok")
                    } else {
                        alert('Ошибка отправки ответа. Больше информации в консоле');
                    }
                }
            };

            XHR.addEventListener('error', function (event) {
                alert('Ошибка соеденения с сервером. Больше информации в консоле');
                console.log(event)
            });

            XHR.open('POST', 'https://answers.acuifex.ru/submit.php?' + params.toString());
            XHR.send();
        }
    });

    request_answer(threadid, question, hint_letter)
}


let already_got_answer = 1
let captcha = document.getElementById("Captcha")
if (captcha && captcha.children.captcha_type.value === "AnswerCaptcha")
    onCaptcha(captcha)

