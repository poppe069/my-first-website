// console.log('Hello World!');

const form = document.querySelector('form'); // grabbing an element on the page
const errorElement = document.querySelector('.error-message');
const resultElement = document.querySelector('.result');
const WOLFRAM_API_URL = "http://api.wolframalpha.com/v2/query";
const API_KEY = "VA2WJ2-9AP4VUVU3H";
const PARAM_OUTPUT = "json";
const PARAM_FORMAT = "plaintext";
const PARAM_SCANNER = "Identity";
const CTRL_345 = "000";
const CTRL_890 = "000";

let controlcode;
let expDate;
let controlCodeLastDigit;
let controlCodeTenDigit;
let noOfMonth;

errorElement.style.display = 'none';

/*
form.addEventListener('reset', function() { 
  form.reset();
  errorElement.textContent = '';
  resultElement.textContent = '';
});
*/

form.addEventListener('submit', (event) => {  
  event.preventDefault();
  const formData = new FormData(form);
  const taxid = formData.get('taxid');
  const amount = formData.get('amount');
  // const controlcode = formData.get('controlcode');

  // console.log(taxid);
  // console.log(amount);
  // console.log(controlcode);

  resultElement.textContent = '';
  resultElement.style.display = 'none';

  errorElement.textContent = '';
  errorElement.style.display = 'none';

  let finalControlCode = '';

  if(validateTaxId(taxid) && validateAmount(amount) && validateControlCode(controlcode)) {

    errorElement.style.display = 'none';
    // form.style.display = 'none';

    // console.log("finish validated");
    finalControlCode = calculate(taxid, amount, controlcode);

    // console.log(finalControlCode);

    const div = document.createElement('div');
    let contents = document.createElement('p');
    contents.textContent = "Tax ID: " + taxid;
    div.appendChild(contents);

    contents = document.createElement('p');
    contents.textContent = "Amount: " + amount;
    div.appendChild(contents);

    contents = document.createElement('p');
    contents.textContent = "Control Code: " + controlcode;
    div.appendChild(contents);

    contents = document.createElement('br');
    div.appendChild(contents);

    contents = document.createElement('p');
    contents.textContent = "Result: " + finalControlCode;
    div.appendChild(contents);

    resultElement.style.display = '';
    resultElement.appendChild(div);
    
  } else {
    errorElement.textContent = "Input value is invalid!";
    errorElement.style.display = '';
  }

});

function calculate(_taxid, _amount, _controlcode) {
  const modulus = 10000;

  let sumTaxID = 0;
  let sumAmount = 0;
  let sumControlCode = 0;
  let modulusResult = 0;

  let taxIDMultiplier = [13, 11, 7, 5, 3, 1];
  let amountMultiplier = [61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 111, 113];
  let controlCodeMultiplier = [17, 19, 23, 29, 31, 37, 41, 43, 53, 59, 117];

  // Tax ID
  let arrTaxID = _taxid.split('');
  // console.log(arrTaxID);
  for(let i=0, j=0; i<10; i+=2, j++) {
    let tmp = Number(arrTaxID[i].concat(arrTaxID[i+1]));
    // console.log(tmp);
    sumTaxID += tmp * taxIDMultiplier[j];
    // console.log(sumTaxID);
  }
  
  if(arrTaxID.length === 13) {
    let tmp = Number(arrTaxID[10].concat(arrTaxID[11], arrTaxID[12]));
    // console.log(tmp);
    sumTaxID += tmp * taxIDMultiplier[5];
    // console.log(sumTaxID);
  }
  // console.log(sumTaxID);

  // Amount
  let arrAmount = _amount.split('');
  let removedItem = arrAmount.splice(arrAmount.length-3, 1); // Remove dot "."
  // console.log(arrAmount);
  for(let i=arrAmount.length, j=0; i>0; i--, j++) {
    sumAmount += Number(arrAmount[i-1]) * amountMultiplier[j];
  }
  // console.log(sumAmount);

  // Control Code
  let arrControlCode = _controlcode.split('');
  for(let i=0; i<arrControlCode.length; i++) {
    sumControlCode += Number(arrControlCode[i]) * controlCodeMultiplier[i];
  }

  // Last digits
  sumControlCode += controlCodeLastDigit * controlCodeMultiplier[10];
  // console.log(sumControlCode);

  // Control Code (11 - 14)
  modulusResult = (sumTaxID + sumAmount + sumControlCode) % modulus;
  // console.log(modulusResult);

  return _controlcode.concat(modulusResult.toString(), controlCodeLastDigit);
}

function validateTaxId(_taxid) {
  if(Number(_taxid) && (_taxid.length === 10 || _taxid.length === 13)) {
    return true;
  } else {
    return false;
  }
}

function validateAmount(_amount) {
  if(Number(_amount)) {
    if(_amount.substr(_amount.length - 3, 1) === ".")
    {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

function validateControlCode(_controlcode) {
  if(Number(_controlcode) && _controlcode.length === 10) {
    return true;
  } else {
    return false;
  }
}

function populateQuery(_expireDate) {
  let prefix = "month from 2002-01 to ";
  
  return prefix.concat(_expireDate.substr(0, _expireDate.length - 3));
}

function paymentDueDateHandler(e) {
  console.log(e.target.value);

  const _value = e.target.value;  
  let expMonth = _value.substr(_value.length - 5, 2);
  let expYear = _value.substr(0, 4);
  expDate = _value.substr(_value.length - 2, 2);

  // console.log(expDate);
  // console.log(expMonth);
  // console.log(expYear);

  let monthDifference = monthDiff(
    new Date(2002, 0, 0), // *Fix start date
    new Date(expYear, Number(expMonth) - 1, 0)
  );

  // Increase monthDifference by 2
  monthDifference += 2;

  // console.log(monthDifference);

  controlCodeLastDigit = monthDifference.toString().substr(0, 1);
  // console.log(controlCodeLastDigit);

  controlCodeTenDigit = expDate.concat(CTRL_345, monthDifference.toString().substr(1, 2), CTRL_890)
  // console.log(controlCodeTenDigit);

  controlcode = controlCodeTenDigit;

  /*
  Experimental: Call Wolfram API for the number of month
  Issue: Found same-origin error while testing on laptop -- fix by assigning 'no-cors' on mode parameter while posting
         but found another javascript error.
  */
  // let input = populateQuery(e.target.value);
  // console.log(input);  
  // fetch(`${WOLFRAM_API_URL}?appid=${API_KEY}&input=${input}&output=${PARAM_OUTPUT}&format=${PARAM_FORMAT}&scanner=${PARAM_SCANNER}`, {
  //     method: "GET",
  //     mode: "no-cors",
  //     cache: "no-cache",
  //     credentials: "omit",
  //     headers: {
  //       "Content-Type": "text/plain;charset=utf-8"
  //     },
  //     referrer: "no-referrer",
  //   })
  //   .then(response => response.json())
  //   .then(result => {
  //     noOfMonth = result.queryresult.pods[1].subpods[0].plaintext;
  //     console.log(noOfMonth);
  //   });

}

function monthDiff(d1, d2) {
  let months;
  months = (d2.getFullYear() - d1.getFullYear()) * 12;
  months -= d1.getMonth() + 1;
  months += d2.getMonth();
  return months <= 0 ? 0 : months;
}

function clearDisplay() {
  resultElement.textContent = '';
  resultElement.style.display = 'none';

  errorElement.textContent = '';
  errorElement.style.display = 'none';
}