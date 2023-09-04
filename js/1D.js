// set the dimensions and margins of the graph
const margin = {top: 10, right: 10, bottom: 10, left: 10},
width = 1800 - margin.left - margin.right,
height = 1200 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#radial")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const dataset = "miserables";
  const ego = "Valjean";
  
  const promises = [
      d3.json('./data/' + dataset + "." + ego + '.edges.json'),
      d3.json('./data/' + dataset + "." + ego + '.nodes.json')
  ];

function color(hop) {
    switch (hop) {
        case 0:
            return 'black';
        case 1:
            return 'red';
        case 2:
            return 'blue';
        case 3:
            return 'turquoise';
        case 4:
            return 'pink';
        case 5: 
            return 'green';
    }
}

Promise.all(promises).then(function(promisedData){
    data = {
        links: promisedData[0],
        nodes: promisedData[1]
    }

    //
    let ego = data.nodes[0].ego;
    let weightMin = Math.min(...data.links.map(d => d.weight))
    console.log(weightMin);
    // data.links = data.links.filter(d => (d.source != ego && d.target != ego));


    // Initialize the links
    var link = svg.append('g')
        .style("stroke", "#aaa")
        .attr("stroke-opacity", 1)
    .selectAll("line")
    .data(data.links)
    .enter()
    .append("line")
        .attr("stroke-width", d => weightMin/3 + d.weight);

    // Initialize the nodes
    const node = svg.append('g')
        .attr("stroke-width", 1)
        .attr('fill', 'white')
    .selectAll("circle.node")
    .data(data.nodes)
    .enter()
    .append("circle")
        .attr('class', 'node')
        .attr("r", 7)
        .style("stroke", d => color(d.hop))

    // Node Overlay (to space edges from nodes)
    const buffer = svg.append('g')
        .attr("stroke-width", 2)
        .attr('stroke', 'white')
        .attr('fill', 'transparent')
    .selectAll("circle.buffer")
    .data(data.nodes)
    .enter()
    .append("circle")
        .attr('class', 'buffer')
        .attr("r", 9);

    // Text
    const text = svg.append('g')
        .attr('class', 'node-text')
        .style("text-anchor", "middle")
        .style('dominant-baseline', 'central')
        .style("font-size", "6pt")
    .selectAll('text')
    .data(data.nodes)
    .enter()
        .append('text')
            .text(d => Math.floor(Math.random() * 99))

    


    // Let's list the force we wanna apply on the network
    var simulation = d3.forceSimulation(data.nodes)                 // Force algorithm is applied to data.nodes
        .force("link", 
            d3.forceLink()
                .strength(0.1)                               // This force provides links between nodes
                .id(function(d) { return d.id; })                       // This provide  the id of a node
                .links(data.links)                                      // and this the list of links
        )
        .force("linear", 
            d3.forceY(d => d.hop * 200)
                .strength(1))
        .force("charge", 
            d3.forceManyBody()
                .strength(-250))         // This adds repulsion between nodes. Play with the -400 for the repulsion strength
        .force("center", 
            d3.forceCenter(width / 2, height / 2))     // This force attracts nodes to the center of the svg area
        //.tick(100000)
        .on("end", ticked);

    // This function is run at each iteration of the force algorithm, updating the nodes position.
    function ticked() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
    
    node
        .attr("cx", function (d) { return d.x; })
        .attr("cy", function(d) { return d.y; });

    buffer
        .attr("cx", function (d) { return d.x; })
        .attr("cy", function(d) { return d.y; });

    text
        .attr('x', function (d) { return d.x; })
        .attr('y', function (d) { return d.y; });
    
    }

}).catch(function(error) {
    console.log(error);
});
