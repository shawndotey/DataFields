class Greeter {
    element: HTMLElement;
    span: HTMLElement;

    timerToken: number;

    constructor(element: HTMLElement) {
        this.element = element;
        this.element.innerHTML += "The time is: ";
        this.span = document.createElement('span');
        this.element.appendChild(this.span);
        this.span.innerText = new Date().toUTCString();
    }

    start() {
        this.timerToken = setInterval(() => this.span.innerHTML = new Date().toUTCString(), 500);
    }

    stop() {
        clearTimeout(this.timerToken);
    }
    update(value:any) {
        this.span.innerHTML = value;

    }

}
module DataFields {

    export class DataField {

        private source: any = null;
        constructor(source: any) {

            this.setSource(source);

        }

        setSource(source: any) {

            if (!source || typeof source !== 'object' || source instanceof Array) throw "DataField.setSource param must be an object that is not an array or null";
            this.source = source;

        }
        getSource(source: any) {

            return this.source;

        }

    }
}



window.onload = () => {
    var el = document.getElementById('content');
    var greeter = new Greeter(el);
   
    greeter.update('ha')
};