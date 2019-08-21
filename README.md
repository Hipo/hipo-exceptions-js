### hipo-exception-transformer 

JavaScript client for parsing the [hipo-drf-exceptions](https://github.com/Hipo/hipo-drf-exceptions)  
  
*This package is in still development, there may be minor changes.*      

#### Basic  Usage   

```typescript      
import ExceptionTransformer from "hipo-exception-transformer";      

// Create an `ExceptionTransformer` instance while your app is bootstrapping      
const exceptionTransformer = new ExceptionTransformer();      

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
      
#### Advanced  Usage 
<details>  
  <summary>Details</summary>  
    
  ```typescript      
  import ExceptionTransformer, {    
    CustomTransformers,    
    Exception,    
    ExceptionMap    
  } from "hipo-exception-transformer";     
        
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
  const exceptionTransformer = new ExceptionTransformer(customExceptionTransformers);      
        
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
  
### Contributing  
After cloning the repo, you can start doing development. Make sure you've `tsc` library installed globally. `npm install -g tsc`  
  
**To compile TypeScript** run the `npm run build` command  
**To fix the ESLint errors** run the `npm run lint:fix` command  
 
