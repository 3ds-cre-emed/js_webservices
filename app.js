/* Imports */
const My3DPassport = require("./lib/my3dpassport");
const My3DSpace = require("./lib/my3dspace");
const readline = require("readline");

let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.stdoutMuted = true;

rl.query = "Password : ";

rl._writeToOutput = function _writeToOutput(stringToWrite) {
  if (rl.stdoutMuted)
    rl.output.write(
      "\x1B[2K\x1B[200D" +
        rl.query +
        "[" +
        (rl.line.length % 2 == 1 ? "=-" : "-=") +
        "]"
    );
  else rl.output.write(stringToWrite);
};

/* 3DEXPERIENCE CREDENTIALS */
let password = "";
let username = "";
let tenant = "RXXXXXXXX";
let securityContext = "Role.Organization.Collaborative Space";
let urlPassport = "https://rxxxxxxx-eu1.iam.3dexperience.3ds.com";
let url3DSpace = "https://rxxxxxxxx-eu1-space.3dexperience.3ds.com/enovia";

let eno_csrf_token = "";
let searchString =  "UBW-21162-02074U";// "SWC-OrbitalSprinkler1";

/* Compiling App */
async function runApp() {
  /* Tell me your password */
  console.log("Please enter your 3D Experience password..");
  rl.question("\nPassword is", async (pass) => {
    console.log("\nThank you! It's proceeded...");
   password = pass;

    /* Create a new session */
    let myAuth = new My3DPassport();
    let mySession = await myAuth.getTicket(urlPassport);

    /* Login to 3DEXPERIENCE Platform */
    let myInfo = {
      username: username,
      password: password,
      tenant: tenant,
      securityContext: securityContext,
      urlService: url3DSpace,
    };

    let myPlatform = await myAuth.loginTo3DSpace(myInfo);

    if (myPlatform.status != 200) {
      let res = {
        statusCode: myPlatform.status,
        statusMessage: "Login failed...",
      };
      console.log(res);
      return res;
    }

    /* Set preffered security context */
    if (securityContext == "") {
      let role = myPlatform.data.preferredcredentials.role.name;
      let company = myPlatform.data.preferredcredentials.organization.name;
      let cs = myPlatform.data.preferredcredentials.collabspace.name;
      securityContext = role + "." + company + "." + cs;
      myPassport.securityContext = securityContext;
    }

    /* Go to 3DSpace with this passport */
    let myPassport = myAuth.passport;
    let my3DSpace = new My3DSpace(myPassport);

    /* Get token for any engineering processes, not everytime just for session */
    let eno_csrf_token = await my3DSpace.get_eno_csrf_token();

    /* Save the token in 3DSpace */
    my3DSpace.eno_csrf_token = eno_csrf_token.data.csrf.value;

    /* Search any engitem */
    let res = await my3DSpace.search_engitem(searchString);

    /* Get searched item instances */
    let instances = await my3DSpace.get_eng_item_instances(
      res.data.member[0].id
    );

    console.log('---------------------MAIN PRODUCT--------------------------');
    console.log(res.data.member[0]);
    console.log('---------------------2LEVEL INSTANCES--------------------------');
    console.log(instances.data.member);

   rl.close();
  });
}

runApp();
