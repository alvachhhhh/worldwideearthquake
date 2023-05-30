let jsonData;
let curves = [];
let time = 0;
let textContainer;
let hoveredLineIndex = -1;

function preload() {
  jsonData = loadJSON("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson");
  print(jsonData);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  strokeWeight(0.5);
  stroke(0);
  noFill();

  for (let i = 0; i < jsonData.features.length; i++) {
    curves.push([]);
  }

}


function draw() {
  background(255);

  //text create
  push(); 

  const textContainer = document.getElementById('text-container');

  textContainer.innerHTML = '';

  const textElement = document.createElement('h1');
  textElement.innerText = 'Earthquake Data';
  textContainer.appendChild(textElement);

  const maxWidth = window.innerWidth - 80; 
  let fontSize = 400;

  while (textElement.offsetWidth > maxWidth) {
    fontSize -= 1;
    textElement.style.fontSize = `${fontSize}px`;
  }


  const textElement2 = document.createElement('h2');
  textElement2.innerText = 'Recent earthquakes worldwide in the past hour (updated every minute).';
  textContainer.appendChild(textElement2);

  let fontSize2 = 30;

  while (textElement2.offsetWidth > maxWidth) {
    fontSize2 -= 1;
    textElement2.style.fontSize = `${fontSize2}px`;
  }


  pop();



  if (jsonData) {
    const features = jsonData.features;

    const curveSpacing = 50;

    const timeExtent = d3.extent(features, d => d.properties.time);

    const yScale = d3.scaleLinear()
      .domain(timeExtent)
      .range([curveSpacing, height - curveSpacing]);

    const totalCurvesHeight = features.length * curveSpacing;
    const yOffset = (height - totalCurvesHeight) / 2;


    let curvePoints = []; 
    let extractedValues;
    let concatenatedValues = "";

    for (let i = 0; i < features.length; i++) {
      const feature = features[i];
      const mag = feature.properties.mag;
      const sig = feature.properties.sig;


      //location
      const placeValue = feature.properties.place;
      const commaIndex = placeValue.indexOf(',');
      const extractedValue = placeValue.substring(commaIndex + 1).trim();

      
      extractedValues = extractedValue.split(',');

      for (let i = 0; i < extractedValues.length; i++) {
        concatenatedValues += "       " + extractedValues[i].trim()+"       "+" | ";
      }
 
      const newTextValue = concatenatedValues.slice(0, -3);

      const textElement3Left= 60;
      const textElement3LeftValue = '\''+textElement3Left +'px'+'\'';
      
      
      const textElement3 = document.createElement('h3');
      textElement3.innerText = 'Position:';
      textElement3.style.bottom = '17.5px';
      textElement3.style.left = "60px";

      textContainer.appendChild(textElement3);
      

      const textElement4LeftValue = '\''+textElement3Left*2.5 +'px'+'\''


      const textElement4 = document.createElement('h4');
      textElement4.innerText = newTextValue;
      textContainer.appendChild(textElement4);
      textElement4.style.bottom = '30px';
      textElement4.style.left = textElement4LeftValue;





      
      //print(extractedValue);

      const curveAmount = map(sig, 0, 1000, 0, 1000) * map(mag, -1, 10, -10, 10);

      const y = yScale(feature.properties.time) * 0.5 + yOffset;

      curvePoints = generateCurvePoints(curveAmount, y, feature.properties.time);
      curves[i] = curvePoints;
    }

    

  



    for (let i = 0; i < features.length; i++) {
      beginShape();
      for (let j = 0; j < curves[i].length; j++) {
        const point = curves[i][j];
        const x = point[0];
        const y = point[1];
        vertex(x, y);
      }
      endShape();

      if (isMouseOverCurve(curvePoints)) {

        noFill();
        stroke(255, 155, 0); // 将线的颜色设置为红色
        strokeWeight(0.5);
        beginShape();
        let x;
        let y;
        for (let j = 0; j < curvePoints.length; j++) {
          const point = curvePoints[j];
          x = point[0];
          y = point[1];
          vertex(x, y);
        }
        endShape();
        
        
      }

      if (isMouseOverCurve(curvePoints)) {
        hoveredLineIndex = i;

        if (mouseIsPressed) {
          showDetail = true;
          detailText = `Details of line ${hoveredLineIndex + 1}`;
        }
      }

      noFill();
      stroke(0);
      strokeWeight(0.5);

    }

  }
}


function generateCurvePoints(curveAmount, y, timeOffset) {
  const curvePoints = [];
  const spacing = 1;

  for (let x = 0; x < width; x += spacing) {
    const nx = map(x, 0, width, 0, 20);
    const noiseValue = noise(nx, time + timeOffset); 
    const curveY = y + curveAmount * noiseValue;
    curvePoints.push([x, curveY]);
  }

  time += 0.005;
  return curvePoints;
}

function handleMouseMove(event) {
  let foundHoveredLine = false; // 标记是否找到悬停的线

  for (let i = 0; i < curves.length; i++) {
    const curvePoints = curves[i];
    if (isMouseOverCurve(curvePoints)) {
      hoveredLineIndex = i;
      foundHoveredLine = true;
      break;
    }
  }

  // 如果没有找到悬停的线，则将 hoveredLineIndex 设置为 -1
  if (!foundHoveredLine) {
    hoveredLineIndex = -1;
  }

  // 更新鼠标是否悬停在曲线附近的状态
  isMouseOverCurve = foundHoveredLine;
}



function isMouseOverCurve(curvePoints) {
  const tolerance = 20; // 容差，用于判断鼠标是否悬停在线附近

  for (let i = 0; i < curvePoints.length; i++) {
    const point = curvePoints[i];
    const x = point[0];
    const y = point[1];

    // 判断鼠标是否在当前点附近
    if (dist(mouseX, mouseY, x, y) <= tolerance) {
      return true;
    }
  }

  return false;
}


//mouse move 
document.addEventListener('DOMContentLoaded', function() {
  const cursorSize = 50;
  const cursor = document.createElement('div');
  cursor.style.width = `${cursorSize}px`;
  cursor.style.height = `${cursorSize}px`;
  cursor.style.background = 'black';
  cursor.style.position = 'fixed';
  cursor.style.pointerEvents = 'none';
  cursor.style.display = 'none';
  document.body.appendChild(cursor);

  document.addEventListener('mousemove', function(event) {
    const x = event.clientX - cursorSize / 2;
    const y = event.clientY - cursorSize / 2;
    cursor.style.transform = `translate(${x}px, ${y}px)`;
  });

  document.addEventListener('mouseleave', function() {
    cursor.style.display = 'none';
  });

  document.addEventListener('mouseenter', function() {
    cursor.style.display = 'block';
  });
});






