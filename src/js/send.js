let testSend = {
    option: {
        method: "POST", 
        url: "http://localhost:5000/"
    },
    create(pram) {
        return new Promise((resolve,reject) => {
            const xhr = new XMLHttpRequest(); // 인스턴스 생성
            xhr.onload = function() { 
                console.log(this);
                this.status == 200 ? resolve(JSON.parse(this.response)) : reject(this);
            }
           
            xhr.option = this.option; // Promise 환경에서 this 는 main 객체를 참조한다 
            xhr.option.sendData = JSON.stringify(xhr.option.data); 
           
            xhr.open(xhr.option.method,xhr.option.url); 
            xhr.send(xhr.option.sendData);
        });
    },
    async getName() {
        try { 
            const res = await this.create(this.option); //resolve this.response 가 담김 
            this.showData(res); 
        } catch(error) {
            this.serverError(error);
        }
    },
    showData(res) { 
        console.log(res);
    },
    serverError(error) {
        console.log(error);
    }
}

function sendRequest(){
    testSend.getName();
}