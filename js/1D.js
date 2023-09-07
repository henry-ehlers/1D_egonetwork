const dataset = "miserables";
const ego = "Javert";

const promises = [
    d3.json('./data/' + dataset + "." + ego + '.edges.json'),
    d3.json('./data/' + dataset + "." + ego + '.nodes.json')
];

// set the dimensions and margins of the graph
const margin = {top: 10, right: 10, bottom: 10, left: 10},
width = 1400 - margin.left - margin.right,
height = 800 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#radial")
.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function color(hop) {
    switch (hop) {
        case -1:
            return 'black';
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
    const hops = [... new Set(data.nodes.map(d => d.hop))];

    // Initialize the links
    var link = svg.append('g')
        .attr("stroke-opacity", 1)
    .selectAll("line")
    .data(data.links)
    .enter()
    .append("line")
        .style("stroke", d => color(d.hop))
        .attr("stroke-width", d => weightMin/3 + d.weight);

    // Node Overlay (to space edges from nodes)
    const buffer = svg.append('g')
        .attr('fill', 'white')
    .selectAll("circle.buffer")
    .data(data.nodes)
    .enter()
    .append("circle")
        .attr('class', 'buffer')
        .attr("r", 9);

    // Add guides
    const guides = svg.append('g')
        .attr('class', 'guide')
        .attr('stroke-width', 1)
        .attr('fill', 'transparent')
        .selectAll('line.guide')
        .data(hops)
        .enter()
        .append('line')
            .attr('class', 'guide')
                .attr('stroke-dasharray', 5, 5)
                .attr('stroke', 'grey')
                .attr('x1', 0)
                .attr('x2', width)
                .attr('y1', d => d * 200)
                .attr('y2', d => d * 200)

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
                .strength(3)
        )
        .force("charge", 
            d3.forceManyBody()
                .strength(-300)
        )         // This adds repulsion between nodes. Play with the -400 for the repulsion strength
        // .force("center", 
        //     d3.forceCenter()
        //         .x(width/2)
        // )     // This force attracts nodes to the center of the svg area
        .on("end", ticked);

    // This function is run at each iteration of the force algorithm, updating the nodes position.
    function ticked() {
    link
        .attr("x1", function(d) { return d.source.x + width/4; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x + width/4; })
        .attr("y2", function(d) { return d.target.y; });
    
    node
        .attr("cx", function (d) { return d.x + width/4; })
        .attr("cy", function(d) { return d.y});

    buffer
        .attr("cx", function (d) { return d.x + width/4; })
        .attr("cy", function(d) { return d.y});

    text
        .attr('x', function (d) { return d.x + width/4; })
        .attr('y', function (d) { return d.y});
    
    }

}).catch(function(error) {
    console.log(error);
});
