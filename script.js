// Firebase-Konfiguration (ersetze mit deinen eigenen Werten)
const firebaseConfig = {
  apiKey: "AIzaSyAe0hmk_gpqE6J_gPIG4WZYNnKPFBp22Cw",
  authDomain: "feedback-wordcloud-test.firebaseapp.com",
  databaseURL: "https://feedback-wordcloud-test-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "feedback-wordcloud-test",
};

// Firebase initialisieren
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Formular-Ereignis-Listener
document.getElementById('feedback-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const input = document.getElementById('feedback-input');
  const word = input.value.trim().toLowerCase();
  if (word) {
    addWordToDatabase(word);
    input.value = '';
  }
});

// Wort zur Datenbank hinzufügen
function addWordToDatabase(word) {
  database.ref('words').push(word);
}

// Wortwolke erstellen
function createWordCloud(words) {
  const wordCount = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  const wordCloudData = Object.entries(wordCount).map(([text, size]) => ({text, size: size * 10}));

  const layout = d3.layout.cloud()
    .size([800, 400])
    .words(wordCloudData)
    .padding(5)
    .rotate(() => ~~(Math.random() * 2) * 90)
    .font("Arial")
    .fontSize(d => d.size)
    .on("end", draw);

  layout.start();

  function draw(words) {
    d3.select("#wordcloud").html("");
    d3.select("#wordcloud")
      .append("svg")
      .attr("width", layout.size()[0])
      .attr("height", layout.size()[1])
      .append("g")
      .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
      .selectAll("text")
      .data(words)
      .enter().append("text")
      .style("font-size", d => d.size + "px")
      .style("font-family", "Arial")
      .style("fill", () => d3.schemeCategory10[Math.floor(Math.random() * 10)])
      .attr("text-anchor", "middle")
      .attr("transform", d => "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")")
      .text(d => d.text);
  }
}

// Daten aus der Datenbank lesen und Wortwolke aktualisieren
database.ref('words').on('value', snapshot => {
  const words = snapshot.val() ? Object.values(snapshot.val()) : [];
  createWordCloud(words);
});
