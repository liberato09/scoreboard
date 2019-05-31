var host = "	m15.cloudmqtt.com";
var port = 32329;
var usessl = true;
var id = (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
var username = "liberato";
var password = "liberato";
var message, client;
var connected = false;


const prefixTopic = "Placar1";
var placar = {
  idPlacar: 'Placar1',
  Temperatura: '',
  Score_A: '',
  Set1_A: '',
  Set2_A: '',
  Set3_A: '',
  Score_B: '',
  Set1_B: '',
  Set2_B: '',
  Set3_B: '',
  Current_set: '1', //adicionei
  Horas: '',
  Minutos: '',
  Segundos: '',
  Inicio: '',
  Zera: '',
  Sacador: '',
  Inte: '',
  Crono: '',
  Backup: '',

}


// for (var property in placar){
//   console.log(property + " = " + placar[property]);
// }

const statusSpan = document.getElementById("status");

function connectionToggle() {
  if (connected) {
    disconnect();
  } else {
    connect();
  }
}

function connect() {
  console.log("Conectando");
  statusSpan.innerHTML = "Conectando...";

  client = new Paho.MQTT.Client(host, port, id);
  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived;
  client.onConnected = onConnected;
  logMessage("INFO", "Connecting to Server: [Host: ",
    host,
    ", Port: ",
    port,
    ", Path: ",
    client.path,
    ", ID: ",
    id,
    "]"
  );

  var options = {
    useSSL: true,
    userName: username,
    password: password,
    reconnect: true,
    onSuccess: onConnect,
    onFailure: doFail
  };
  client.connect(options);
  document.getElementById("clientConnectButton").innerHTML = "Desconectar";
}

function disconnect() {
  logMessage("INFO", "Disconnecting from Server.");
  client.disconnect();
  var statusSpan = document.getElementById("status");
  statusSpan.innerHTML = "Desconectado.";
  connected = false;
  document.getElementById("clientConnectButton").innerHTML = "Conectar";
}

function onConnect() {
  console.log("Conectado");
  statusSpan.innerHTML = "Conectado";
  connected = true;
  client.subscribe(placar.idPlacar + "/#");
  
  // message = new Paho.MQTT.Message("Hello Placar1");
  // message.destinationName = placar.idPlacar + "/hello";
  // client.send(message);
}

function onConnected(reconnect, uri) {
  // Once a connection has been made, make a subscription and send a message.
  logMessage("INFO", "Client Has now connected: [Reconnected: ", reconnect, ", URI: ", uri, "]");
  connected = true;
}

function doFail(e) {
  console.log(e);
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("onConnectionLost:" + responseObject.errorMessage);
  }
}

// called when a message arrives
function onMessageArrived(message) {
  console.log("onMessageArrived: " + message.destinationName + ", " + message.payloadString);
  // logMessage(
  //   "INFO",
  //   "Message Recieved: [Topic: ",
  //   message.destinationName,
  //   ", Payload: ",
  //   message.payloadString,
  //   ", QoS: ",
  //   message.qos,
  //   ", Retained: ",
  //   message.retained,
  //   ", Duplicate: ",
  //   message.duplicate,
  //   "]"
  // );
  
  const topic = message.destinationName.split("/")[1];
  placar[topic] = message.payloadString;

  if(topic === 'Current_set') return;

  
  if(topic === 'Sacador'){
    let player = message.payloadString;
    document.getElementById("PlayerA_serve").style.visibility = (player === "A"? 'visible': 'hidden');
    document.getElementById("PlayerB_serve").style.visibility = (player === "B"? 'visible': 'hidden');

    document.getElementById("PlayerA_serveButton").src = "./img/" + (player === "A"? 'ball_on.svg': 'ball_off.svg');
  document.getElementById("PlayerB_serveButton").src = "./img/" + (player === "B"? 'ball_on.svg': 'ball_off.svg');
  
  }else{
    document.getElementById(topic).innerHTML = message.payloadString;
  }

  
}

function logMessage(type, ...content) {
  var consolePre = document.getElementById("consolePre");
  var date = new Date();
  var timeString = date.toUTCString();
  var logMessage =
    "<p>" + timeString + " - " + type + " - " + content.join("") + "</p>";
  consolePre.innerHTML += logMessage;
  if (type === "INFO") {
    console.info(logMessage);
  } else if (type === "ERROR") {
    console.error(logMessage);
  } else {
    console.log(logMessage);
  }
}


function sendMessage(topic, messageText, retained=true){
  message = new Paho.MQTT.Message(messageText);
  message.destinationName = placar.idPlacar +"/"+ topic;
  message.retained = retained;
  placar[topic] = messageText;
  client.send(message);
  // console.log(placar);
}

function setServe(player){
  placar.Sacador = player;
  sendMessage('Sacador', player);

  

  document.getElementById("PlayerA_serveButton").src = "./img/" + (player === "A"? 'ball_on.svg': 'ball_off.svg');
  document.getElementById("PlayerB_serveButton").src = "./img/" + (player === "B"? 'ball_on.svg': 'ball_off.svg');
}

function increaseSet(player){
  const currentSet = placar.Current_set;
  const set = "Set" + currentSet + "_" + player;
  var scoreSet = Number( (placar[set] === '' ? 0 : placar[set]));
  if(scoreSet < 7){
    scoreSet++; 
    placar[set] = scoreSet.toString();
    sendMessage(set, placar[set]);
  }
}

function decreaseSet(player){
  const currentSet = placar.Current_set;
  const set = "Set" + currentSet + "_" + player;
  var scoreSet = Number( (placar[set] === '' ? 0 : placar[set]));  
  if(scoreSet > 0){
    scoreSet--; 
    placar[set] = scoreSet.toString();
    sendMessage(set, placar[set]);
  }
}

function setCurrentSet(set){
  placar['Current_set'] = set.toString();
  sendMessage('Current_set', set.toString());
}