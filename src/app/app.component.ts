/**
 * 参考地址
 * http://bl.ocks.org/mbostock/1153292
 * https://segmentfault.com/a/1190000015644659
 * http://jsfiddle.net/dung7n0d/1/
 * http://bl.ocks.org/eesur/be2abfb3155a38be4de4
 * http://bl.ocks.org/d3noob/9662ab6d5ac823c0e444
 */
import { Component, OnInit, AfterContentInit } from '@angular/core';
declare var d3;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterContentInit {

  links = [
    { source: 'Microsoft', target: 'Amazon', type: 'licensing' },
    { source: 'Amazon', target: 'Microsoft', type: 'suit' },
    { source: 'Microsoft', target: 'HTC', type: 'licensing' },
    { source: 'Samsung', target: 'Apple', type: 'suit' },
    { source: 'Motorola', target: 'Apple', type: 'suit' },
    { source: 'Nokia', target: 'Apple', type: 'resolved' },
    { source: 'HTC', target: 'Apple', type: 'suit' },
    { source: 'Kodak', target: 'Apple', type: 'suit' },
    { source: 'Microsoft', target: 'Barnes & Noble', type: 'suit' },
    { source: 'Microsoft', target: 'Foxconn', type: 'suit' }
  ];

  nodes = {};

  image = {
    boat: require('src/assets/images/boat.png'),
    air: require('src/assets/images/air.png')
  }

  ngOnInit() {
    this.links.forEach(link => {
      link.source = this.nodes[link.source] || (this.nodes[link.source] = {name: link.source});
      link.target = this.nodes[link.target] || (this.nodes[link.target] = {name: link.target});
    });
  }

  ngAfterContentInit() {
    let width = document.body.offsetWidth,
        height = document.body.offsetHeight;

    d3.select('body')
      .on("touchstart", nozoom)
      .on("touchmove", nozoom);

    let force = d3.layout.force()
      .nodes(d3.values(this.nodes))
      .links(this.links)
      .size([width, height])
      .linkDistance(100)
      .charge(-300)
      .on('tick', tick)
      .start();

    let drag = force.drag()
      .on('dragend', dragend);

    let svg = d3.select('body').append('svg')
      .attr('width', width)
      .attr('height', height);

    svg.append('defs').selectAll('marker')
      .data(['suit', 'licensing', 'resolved'])
      .enter().append('marker')
      .attr('id', function(d) { return d; })
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 23) // 可以调整箭头距离目标的位置
      .attr('refY', -1.5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5');
  
    let path = svg.append('g').selectAll('path')
      .data(force.links())
      .enter().append('path')
      .attr('class', function(d) { return 'link ' + d.type; })
      .attr('marker-end', function(d) { return 'url(#' + d.type + ')'; });
    
    let node = svg.selectAll('g.node').data(force.nodes());
        
    let nodeEnter = node.enter().append('g')
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      .call(force.drag)
      .each(e => {});

    let circle = nodeEnter
      .append('circle')
      .attr('r', 12)
      .attr('class', 'node') // 增加class
      .call(force.drag);

    var image = nodeEnter
      .append('image')
      .attr('xlink:href', (d) => this.image.boat)
      .attr('class', 'img')
      .attr('x', '-12px')
      .attr('y', '-12px')
      .attr('width', '24px')
      .attr('height', '24px');
  
    var text = nodeEnter
        .append('text')
        .attr('x', 15)
        .attr('y', '.31em')
        .text(function(d) { return d.name; });
  
    // Use elliptical arc path segments to doubly-encode directionality.
    function tick() {
      path.attr('d', linkArc);
      node.attr('transform', transform);
    }
  
    function linkArc(d) {
      var dx = d.target.x - d.source.x,
          dy = d.target.y - d.source.y,
          dr = Math.sqrt(dx * dx + dy * dy);
      return 'M' + d.source.x + ',' + d.source.y + 'A' + dr + ',' + dr + ' 0 0,1 ' + d.target.x + ',' + d.target.y;
    }
  
    function transform(d) {
      return 'translate(' + d.x + ',' + d.y + ')';
    }

    function nozoom() {
      d3.event.preventDefault(); // 阻止默认事件
    }

    function dragend(d) {
      d3.select(this).classed('fixed', d.fixed = true); // 把点固定
    }

    // 给节点新增点击事件
    // 单击
    svg.selectAll('g.node').on('click', function(d) {
      if (d3.event.defaultPrevented) return;
      d3.select(this).classed('fixed', d.fixed = false); // 把点释放固定
    });

    svg.selectAll('path.link').on('click', function(d) {
      let node = d3.select(this);
      console.log(node);
      console.log(d);
      console.log('左键点击');
    });

    svg.selectAll('path.link').on('contextmenu', function(d) {
      let node = d3.select(this);
      console.log(node);
      console.log(d);
      console.log('右键点击');
    });
  }
}
