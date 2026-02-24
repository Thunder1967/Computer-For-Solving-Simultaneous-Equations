var CalculateMode = 0; //0:int 1:float
const InBarId = document.getElementById("input");
const OutBarId = document.getElementById("output");
const ShowResult = document.getElementById("result");
const ShowWarning = document.getElementById("alert1");
const AdvancedSetting = document.getElementById("advanced-setting");
const AdvancedSettingMain = document.getElementById("advanced-setting-main");
const FloatRound = document.getElementById("float-round");
const FloatDisplayNumber = document.getElementById("float-display-number");
const OnlyResultMain = document.getElementById("only-result-main");
const Unicode = {
    subnumber: ["₀","₁","₂","₃","₄","₅","₆","₇","₈","₉"],
    formSubnumber: function(aim){
        let out ="";
        if(typeof(aim) == "number"){
            aim = aim.toString();
        }
        for(let i=0;i<aim.length;i++){
            out+=this.subnumber[parseInt(aim[i])];
        }
        return out;
    }
}
const Mode = [
    {
        id: document.getElementById("intmode"),
        display: [
            document.getElementById("only-result")
        ],
        hide: [
            document.getElementById("float-calculate")
        ]
    },
    {
        id: document.getElementById("floatmode"),
        display: [
            document.getElementById("only-result"),
            document.getElementById("float-calculate")
        ],
        hide: [
            
        ]
    }
]


//init
InBarId.value = "1 -1 2 3\n5 6 6 5\n4 3 2 1";
change_mode(0);

function gcd(a,b){
    [a,b]=[Math.max(a,b),Math.min(a,b)]
    if(b==0){
        return a;
    }
    while(a%b!=0){
        a=a%b;
        [a,b]=[b,a];
    }
    return b;
}
function handle(){
    OutBarId.value="";
    ShowWarning.hidden = true;
    if(FloatDisplayNumber.value>10){
        FloatDisplayNumber.value = 10;
    }
    else if(FloatDisplayNumber.value<0){
        FloatDisplayNumber.value = 0;
    }

    //輸入處理
    const C = InBarId.value.split("\n");
    let init_Mx = [];
    for(let i=0;i<C.length;i++){
        init_Mx.push(C[i].split(" "));
    }
    //校正輸入資料
    let Mx=[];
    let column_num = -1;
    for(let i=0;i<init_Mx.length;i++){
        let z = [];
        let isEmpty = true;
        for(let j=0;j<init_Mx[i].length;j++){
            if(CalculateMode == 0){
                var x = parseInt(init_Mx[i][j],10);
            }
            else if(CalculateMode == 1){
                var x = parseFloat(init_Mx[i][j]);
            }

            if(!isNaN(x)){
                z.push(x);
                isEmpty = false;
            }
        }
        if(!isEmpty){
            if(column_num == -1){
                column_num = z.length;
            }
            else if(column_num!=z.length){
                ShowResult.innerHTML="執行失敗";
                ShowResult.style.color = "red";
                ShowWarning.hidden = false;
                setTimeout(function (){
                    ShowResult.innerHTML="";
                },"2000");
                return -1;
            }
            Mx.push(z);
        }
    }

    if(CalculateMode == 0){
        //高斯消去
        for(let i=0;i<Math.min(column_num-1,Mx.length);i++){
            for(let j=0;j<Mx.length-1;j++){
                if(Mx[j][i]!=0){
                    for(let k=j+1;k<Mx.length;k++){
                        if(Mx[k][i]!=0){
                            const b = Mx[k][i];
                            for(let l=0;l<column_num;l++){
                                Mx[k][l] = Mx[k][l]*Mx[j][i] - b*Mx[j][l];
                            }
                            /*test
                            for(let i=0;i<Mx.length;i++){
                                for(let j=0;j<column_num;j++){
                                    OutBarId.value+=(CalculateMode == 1 ? roundto(Mx[i][j]) : Mx[i][j])+' ';
                                }
                                OutBarId.value+='\n';
                            }
                            OutBarId.value+='\n';
                            */
                        }//找目標
                    }
                    [Mx[j],Mx[Mx.length-i-1]]=[Mx[Mx.length-i-1],Mx[j]]
                    break;
                }//找主要模板
            }
        }
        //化簡
        for(let i=0;i<Mx.length;i++){
            let a = Mx[i].concat();
            for(let j=0;j<a.length-1;j++){
                a[j+1] = gcd(a[j],a[j+1]);
            }
            const gcd_result = a[a.length-1];
            if(gcd_result == 0){continue;}
            for(let j=0;j<Mx[i].length;j++){
                Mx[i][j]/=gcd_result;
            }
        }
    }
    else if(CalculateMode == 1){
        //高斯消去
        for(let i=0;i<Math.min(column_num-1,Mx.length);i++){
            for(let j=0;j<Mx.length-1;j++){
                if(Mx[j][i]!=0){
                    for(let k=j+1;k<Mx.length;k++){
                        if(Mx[k][i]!=0){
                            const b = Mx[k][i]/Mx[j][i];
                            for(let l=0;l<column_num;l++){
                                Mx[k][l] -= b*Mx[j][l];
                            }
                            Mx[k][i]=0;
                        }//找目標
                    }
                    [Mx[j],Mx[Mx.length-i-1]]=[Mx[Mx.length-i-1],Mx[j]]
                    break;
                }//找主要模板
            }
        }
        //化簡
        for(let i=0;i<Mx.length;i++){
            let a = Mx[i].concat();
            let find_result = 0;
            for(let j=0;j<a.length-1;j++){
                if(a[j]!=0){
                    find_result = a[j];
                    break;
                }
            }
            if(find_result == 0){continue;}
            for(let j=0;j<Mx[i].length;j++){
                Mx[i][j]/=find_result;
            }
        }
    }

    ShowResult.innerHTML="執行成功";
    ShowResult.style.color = "rgb(10, 200, 10)";
    if(OnlyResultMain.checked){
        let sortList = [];
        for(let i=0;i<Mx.length;i++){
            let out="";
            let first = -1;
            let z = false;
            for(let j=0;j<column_num-1;j++){
                let a = Mx[i][j];
                if(a!=0){
                    if(first==-1){
                        let c = CalculateMode == 1 ? roundto(a) : a;
                        out+=(c == 1 ? "" : c) + "X"+Unicode.formSubnumber(j+1);
                        first = j;
                        if(CalculateMode==0 && c!=1){
                            z = true;
                        }
                    }
                    else{
                        let c = CalculateMode == 1 ? Math.abs(roundto(a)) : Math.abs(a)
                        out+=(a>0 ? " + " : " - ")+(c == 1 ? "" : c)+"X"+Unicode.formSubnumber(j+1);
                        z = false;
                    }
                }
            }
            let b = Mx[i][column_num-1];
            if(first==-1){
                if(b!=0){
                    OutBarId.value="-1";
                    break;
                }
                else{
                    continue;
                }
            }
            else{
                if(z){
                    let x = out.split("X");
                    out = "X"+x[1]+" = "+b+"/"+x[0];
                }
                else{
                    out+=" = "+(CalculateMode == 1 ? roundto(b) : b);
                }
                sortList.push([out,first]);
            }
        }
        if(OutBarId.value!="-1"){
            sortList.sort(function(a,b){
                return(a[1]-b[1])
            })
            OutBarId.value="此聯立方程式化簡後必符合以下關係式:\n";
            for(let i=0;i<sortList.length;i++){
                OutBarId.value+=sortList[i][0]+"\n";
            }
        }
        else{
            OutBarId.value="無解";
        }

    }
    else{
        for(let i=0;i<Mx.length;i++){
            for(let j=0;j<column_num;j++){
                OutBarId.value+=(CalculateMode == 1 ? roundto(Mx[i][j]) : Mx[i][j])+' ';
            }
            OutBarId.value+='\n';
        }
    }
    setTimeout(function (){
        ShowResult.innerHTML="";
    },"2000");
}
function change_mode(Aim){
    for(let i in Mode){
        if(Mode[i].id.classList.contains("enablemode")){
            Mode[i].id.classList.remove("enablemode");
            break;
        }
    }
    for(let i in Mode[Aim].display){
        Mode[Aim].display[i].hidden = false;
    }
    for(let i in Mode[Aim].hide){
        Mode[Aim].hide[i].hidden = true;
    }
    Mode[Aim].id.classList.add("enablemode");
    CalculateMode = Aim;
}
function resetform(){
    OutBarId.value="";
    ShowWarning.hidden = true;
    InBarId.value = "";
}
function advancedsetting(){
    if(AdvancedSettingMain.hidden){
        AdvancedSettingMain.hidden = false;
        AdvancedSetting.value = "▼ 進階設定";
    }
    else{
        AdvancedSettingMain.hidden = true;
        AdvancedSetting.value = "▶ 進階設定";

    }
}
function roundto(a){
    let int_part = Math.trunc(a);
    let float_part = a - int_part;
    let b = FloatDisplayNumber.value;
    let c = FloatRound.value;
    float_part *= 10**b;
    switch(c){
        case "0":
            float_part=Math.ceil(float_part);
            break;
        case "1":
            float_part=Math.round(float_part);
            break;
        case "2":
            float_part=Math.floor(float_part);
            break;
        default:
            break;
    }
    if(b==0){
        return int_part + float_part;
    }
    else if(float_part==0){
        return int_part;
    }
    else{
        let Fill =Math.abs(float_part).toString()
        for(let i=0,L=Fill.length;i<b-L;i++){Fill='0'+Fill}
        Fill='0.'+Fill
        return int_part+parseFloat(Fill)*Math.sign(float_part);
    }
}
//v.1.4.4