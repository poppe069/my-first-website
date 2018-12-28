console.log('Hello World!');

const form = document.querySelector('form'); // grabbing an element on the page
const errorElement = document.querySelector('.error-message');
const resultElement = document.querySelector('.result');

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
  const controlcode = formData.get('controlcode');

  // console.log(taxid);
  // console.log(amount);
  // console.log(controlcode);

  resultElement.textContent = '';
  resultElement.style.display = 'none';

  let finalControlCode = '';

  if(validateTaxId(taxid) && validateAmount(amount) && validateControlCode(controlcode)) {
    
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
  let controlCodeMultiplier = [17, 19, 23, 29, 31, 37, 41, 43, 53, 59];

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
  // console.log(sumControlCode);

  // Control Code (11 - 14)
  modulusResult = (sumTaxID + sumAmount + sumControlCode) % modulus;
  // console.log(modulusResult);

  return _controlcode.concat(modulusResult.toString(), "0");

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