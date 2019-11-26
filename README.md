## hipo-exceptions-js

JavaScript client for parsing the [hipo-drf-exceptions](https://github.com/Hipo/hipo-drf-exceptions)    

### exceptionTransformer.generateExceptionMap  

```typescript      
import ExceptionTransformer from "hipo-exceptions-js";      

// Create an `ExceptionTransformer` instance while your app is bootstrapping      
const exceptionTransformer = new ExceptionTransformer(GENERIC_ERROR_MESSAGE);      

// Use the instance to generate an ExceptionMap      
// It's basically what you get from API    
// You can use in anywhere you want    
const signupExceptionMap = exceptionTransformer.generateExceptionMap(      
  response.error      
);    

// Now you've got an ExceptionMap, you can show up in the UI      
<InputField name={"email"}      
            error={signupExceptionMap.get("email")} />      
```  
<details>  
  <summary>Advanced  Usage with exceptionTransformer.generateExceptionMap</summary>  
    
  ```typescript      
  import ExceptionTransformer, {    
    CustomTransformers,    
    Exception,    
    ExceptionMap    
  } from "hipo-exceptions-js";     
        
  // Define your application's custom exception transformers    
  const customExceptionTransformers: CustomTransformers = {      
    ProfileCredentialError: (exception: Exception): ExceptionMap => {      
      const map = new Map();      
      
      if (exception.detail.email) {     
        map.set("email", exception.detail.email);      
      }    
          
      // You can set a custom `fallback_message`   
      // instead of using `exception.fallback_message`  
      map.set("fallback_message", "Something went wrong. Please try again later.");    
          
      return map;
    }
  };    
        
  // Create an `ExceptionTransformer` instance with `customExceptionTransformers` param       
  const exceptionTransformer = new ExceptionTransformer(GENERIC_ERROR_MESSAGE, {customExceptionTransformers});      
        
  // Use the instance to generate an ExceptionMap      
  // It's basically what you get from API    
  // You can use in anywhere you want    
  const signupExceptionMap = exceptionTransformer.generateExceptionMap(      
    response.error      
  );      
        
  // Now you've got an ExceptionMap, you can show up in the UI    
  <GenericError message={signupExceptionMap.get("fallback_message")} />    
  <InputField name={"email"}      
              error={signupExceptionMap.get("email")} />      
  ```       
</details> 

### exceptionTransformer.generateErrorMessage
  * `generateErrorMessage(errorInfo)` will return an empty string `""`, a meaningful error message generated from `errorInfo` or the `GENERIC_ERROR_MESSAGE` you have provided initializing `ExceptionTransformer`. You can trust this function to display a string error message.

  * You can provide `knownErrorKeys` and `skipTypes` to `generateErrorMessage` function `knownErrorKeys` is used to define error keys you have handled and `skipTypes` is used not to handle some error types. Please see examples below.

  * `non_field_errors` has priorty in an error object. Please compare `exampleTwo` and `exampleFive` for clarity.
  
### exceptionTransformer.generateSpecificFieldError
  * `generateSpecificFieldError(errorInfo)` will return you a function which accepts a `fieldName`, i.e, path to a certain value. You can use this function to display an error for a spesific field. **Be careful**, this function does not guarentee to return `string[]`! 
  
## Examples
``` typescript
import ExceptionTransformer from "hipo-exceptions-js";      

// Create an `ExceptionTransformer` instance while your app is bootstrapping      
const exceptionTransformer = new ExceptionTransformer(GENERIC_ERROR_MESSAGE);
```
<details>
    <summary>exampleOne</summary> 
  
``` typescript
const exampleOne = {
  type: "ValidationError",
  detail: {
    email: ["Enter a valid email address."],
    password: ["Enter a valid password address."]
  },
  fallback_message: "This is a random fallback message"
};

const getFieldError = exceptionTransformer.generateSpecificFieldError(exampleOne);

getFieldError("email") // ["Enter a valid email address."]
getFieldError("summary") // undefined

exceptionTransformer.generateErrorMessage(exampleOne) // "email: Enter a valid email address."
exceptionTransformer.generateErrorMessage(exampleOne, {knownErrorKeys:["email"]}) // "password: Enter a valid password address."
```
</details> 

<details>
    <summary>exampleTwo</summary> 
  
```typescript
const exampleTwo = {
  type: "IncompleteAnswerError",
  detail: {
    attachment: ["Please add an attachment"],
    non_field_errors: ["All required questions must be answered."]
  },
  fallback_message: "This is a random fallback message"
};


exceptionTransformer.generateErrorMessage(exampleTwo) // "All required questions must be answered." 
``` 
</details>
<details>
    <summary>exampleThree</summary> 
  
``` typescript
const exampleThree = {
  type: "ValidationError",
  detail: {
    non_field_errors: [
      {},
      {},
      {},
      {},
      {phone_number: ["The phone number entered is not valid."]}
    ]
  },
  fallback_message: "This is a random fallback message"
};

exceptionTransformer.generateErrorMessage(exampleThree); // "phone_number: The phone number entered is not valid."
 ```
</details>

<details>
    <summary>exampleFour</summary> 
  
``` typescript
const exampleFour = {
  type: "ValidationError",
  detail: {
    message: {
      body: ["Message body is missing"],
      attachment: ["Attachment is missing"]
    },
    password: ["Password is too short", "Please use only letters and numbers"]
  },
  fallback_message: "This is a random fallback message"
};

---
const getFieldError = exceptionTransformer.generateSpecificFieldError(exampleFour);

exceptionTransformer.getFieldError("message") // <- Returns { body: ["Message body is missing"], attachment: ["Attachment is missing"] } So Do not use this one for that purpose.
exceptionTransformer.getFieldError("message.attachment") // ["Attachment is missing"]
exceptionTransformer.getFieldError("summary.info") // undefined
exceptionTransformer.getFieldError("password") // ["Password is too short",  "Please use only letters and numbers"]

exceptionTransformer.generateErrorMessage(exampleFour, {knownErrorKeys: ["password", "message.body"]}) // "attachment: Attachment is missing"
 ```
</details>

<details>
    <summary>exampleFive</summary> 
  
``` typescript
const exampleFive = {
  type: "ValidationError",
  detail: {
    summary: ["Summary is missing"],
    message: {
      non_field_errors: ["Attachments or body must be provided."],
      title: ["Message title is missing"]
    }
  },
  fallback_message: "This is a random fallback message"
};
---
const getFieldError = exceptionTransformergenerateSpecificFieldError(exampleFive);

exceptionTransformer.getFieldError("message") /// <- Returns { non_field_errors: ["Attachments or body must be provided."], title: ["Message title is missing"] } So Do not use this one for that purpose.
exceptionTransformer.getFieldError("message.title") // ["Message title is missing"]

exceptionTransformer.generateErrorMessage(exampleFive) // "summary: Summary is missing"
exceptionTransformer.generateErrorMessage(exampleFive, {knownErrorKeys: ["summary", "message.title"]}) // "Attachments or body must be provided."
exceptionTransformer.generateErrorMessage(exampleFive, {knownErrorKeys: ["summary", "message"]}) // "" -> empty string since all errors are known
exceptionTransformer.generateErrorMessage(exampleFive, {skipTypes: ["ValidationError"]}) // "" -> empty string since error.type should skipped.
exceptionTransformer.generateErrorMessage({
 type: "CustomMessageError",
 detail: exampleFive.detail.message,
 fallback_message: "" 
}, {knownErrorKeys: ["title"]}) // "Attachments or body must be provided."

```
</details>


<details>
    <summary>exampleSix</summary> 

``` typescript
A Form that has a bulk creation section. Assume there is a form with an input `Title` and a `Questions` section. 

const exampleSix = {
    type: "ValidationError",
    detail: {
      title: ["Title is missing"],
      questions: [{}, {}, {}, {answer: ["required"]}, {}]},
    fallback_message: "This is a random fallback message"
};

---

exceptionTransformer.generateErrorMessage({
 type: "CustomMessageError",
 detail: exampleSix.detail,
 fallback_message: ""
}, {knownErrorKeys: ["questions"]}) // "title: Title is missing"
exceptionTransformer.generateErrorMessage({
 type: "CustomMessageError",
 detail: exampleSix.detail,
 fallback_message: "" 
}, {knownErrorKeys: ["title", "questions"]}) // ""

---
- Displaying error message for `Questions` section:

const getFieldError = exceptionTransformer.generateSpecificFieldError(exampleSix);

exceptionTransformer.getFieldError("questions"); /// <- Returns [{}, {}, {}, {answer: ["required"]}, {}]. So Do not use this one for that purpose.

exceptionTransformer.generateErrorMessage({
 type: "CustomMessageError",
 detail: exampleSix.detail.questions,
 fallback_message: "" 
}) // "answer: required"

```
</details>


<details>
    <summary>exampleSeven</summary> 

``` typescript
A non-complete error message

const exampleSeven = {
    type: "ValidationError",
    detail: {},
    fallback_message: ""
  };

---
const getFieldError = exceptionTransformer.generateSpecificFieldError(exampleSeven);

exceptionTransformer.getFieldError("questions") // undefined

exceptionTransformer.generateErrorMessage(exampleSeven, {knownErrorKeys: ["questions"]}) // GENERIC_ERROR_MESSAGE since `detail` and `fallback_message` are empty 
```
</details>

<details>
    <summary>exampleEight</summary> 

``` typescript
An empty error message

const exampleEight = {};

---
const getFieldError = exceptionTransformer.generateSpecificFieldError(exampleEight);

exceptionTransformer.getFieldError("questions") // undefined

exceptionTransformer.generateErrorMessage(exampleEight, {knownErrorKeys: ["questions"]}) // GENERIC_ERROR_MESSAGE since error is an empty object
```
</details>

<details>
    <summary>exampleNine</summary> 

``` typescript
const exampleNine = {
    type: "ValidationError",
    detail: {
      questions: [],
      title: ["Title is missing"]},
    fallback_message: "This is a random fallback message"
};

---
const getFieldError = exceptionTransformer.generateSpecificFieldError(exampleNine);

exceptionTransformer.getFieldError("questions") // []

exceptionTransformer.generateErrorMessage(exampleNine) // "questions: undefined"
```
</details>
  
## Contributing  
After cloning the repo, you can start doing development. Make sure you've `tsc` library installed globally. `npm install -g tsc`  
  
**To compile TypeScript** run the `npm run build` command  
**To fix the ESLint errors** run the `npm run lint:fix` command  
 
