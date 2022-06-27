class K{static camelToTitle(t){const e=t.replace(/([A-Z])/g," $1");return e.charAt(0).toUpperCase()+e.slice(1)}static getDayFromInt=t=>{switch(t){case 0:return"Sunday";case 1:return"Monday";case 2:return"Tuesday";case 3:return"Wednesday";case 4:return"Thursday";case 5:return"Friday";case 6:return"Saturday"}};static getInputData(t,e){if("input"===t.type&&"INPUT"===t.target.tagName){const a=t.currentTarget.value;return e&&e(),{q:a}}throw new Error("getInputHandler requires a input event as its first arguement.")}static getFormData(t,e){const a=t.currentTarget;if("submit"===t.type&&"FORM"===a.tagName){const t={};let r=!0;for(let e=0;r;e++)t[a[e].name]=a[e].value,a[e+1]||(r=!1);return e&&e(),t}throw new Error("getK requires a form submit event as its first arguement.")}static handleResponse(t,e,a="Results"){const r=$(e);r.fadeOut(500),setTimeout((()=>{if(r.empty(),r.append($(`<h2>${a}</h2>`)),"ok"===t.status.name)if(Array.isArray(t.data)||(t.data=[t.data]),t.data.length>0){const e=$("<ol></ol>");r.append(e),t.data.forEach((t=>{const a=$('<li class="result"></li>');for(let e in t){const r=t[e],s=$("<div></div>");a.append(s),s.append($(`<h3>${K.camelToTitle(e)}</h3>`)),s.append($(`<p>${r}</p>`))}e.append(a)}))}else r.append($('<p class="none">There are no results that meet your search criteria.</p>'));r.fadeIn(500)}),500)}static farToCel(t){return 5/9*(t-32)}static farToKel(t){return 273.15+5*(t-32)/9}static kelToCel(t){return t-273.15}static kelToFar(t){return 1.8*(t-273)+32}static celToFar(t){return 33.8}static celToKel(t){return t+273.15}static pajax(t,e={}){const{data:a,method:r,type:s}=e;return new Promise(((e,n)=>{$.ajax({data:a,dataType:s,type:r,url:t,success:t=>{e(t)},error:(t,e,a)=>{n({jqXHR:t,textStatus:e,err:a})}})}))}static toTitle=t=>{if(t)return t.split(" ").map((t=>t.slice(0,1).toUpperCase()+t.slice(1))).join(" ")}}export default K;
