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
        { source: 'Microsoft', target: 'Amazon', type: 'licensing', text: 'in 关系' },
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
    checkedNode: any;

    image = {
        boat: require('src/assets/images/boat.png'),
        air: require('src/assets/images/air.png')
    };

    ngOnInit() {
        this.links.forEach(link => {
            link.source =
                this.nodes[link.source] ||
                (this.nodes[link.source] = { name: link.source });
            link.target =
                this.nodes[link.target] ||
                (this.nodes[link.target] = { name: link.target });
        });

        this.nodes['Air'] = {name: 'Air'}; // 新增单个节点
    }

    ngAfterContentInit() {
        let width = document.body.offsetWidth,
            height = document.body.offsetHeight;

        d3.select('body')
            .on('touchstart', nozoom)
            .on('touchmove', nozoom);

        function nozoom() {
            d3.event.preventDefault(); // 阻止默认事件
        }

        let force = d3.layout
            .force()
            .nodes(d3.values(this.nodes))
            .links(this.links)
            .size([width, height])
            .linkDistance(300)
            .charge(-400)
            .on('tick', tick)
            .start();

        let nodes = force.nodes(),
            links = force.links();

        // 画svg
        let svg = d3
            .select('body')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        // 画箭头
        svg.append('defs')
            .selectAll('marker')
            .data(['suit', 'licensing', 'resolved'])
            .enter()
            .append('marker')
            .attr('id', function(d) {
                return d;
            })
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 23) // 可以调整箭头距离目标的位置
            .attr('refY', -1.5)
            .attr('markerWidth', 9)
            .attr('markerHeight', 9)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5');

        let path = svg
            .append('g')
            .attr('class', 'path')
            .selectAll('path');
        let pathOutline = svg
            .append('g')
            .attr('class', 'pathOutline')
            .selectAll('path');
        let pathText = svg
            .append('g')
            .selectAll('text');
        let node = svg.selectAll('g.node');

        let _this = this;

        function addLinks() {
            path = path.data(links);
            path.enter()
                .append('path')
                .attr('id', function(d) {
                    return `path-${d.source.index}-${d.target.index}`;
                })
                .attr('class', function(d) {
                    return 'link ' + d.type;
                })
                .attr('marker-end', function(d) {
                    return 'url(#' + d.type + ')';
                });
            path.exit().remove();

            pathOutline = pathOutline.data(links);
            pathOutline.enter()
                .append('path')
                .attr('id', function(d) {
                    return `pathOutline-${d.source.index}-${d.target.index}`;
                })
                .attr('class', function(d) {
                    return 'link-outline ' + d.type;
                });
            pathOutline.exit().remove();

            pathText = pathText.data(links);
            pathText.enter()
                .append('text')
                .style('font-size', '10px')
                .attr('dy', '-5px') // 文字和线条的距离
                .append('textPath')
                .attr('xlink:href', function(d) {
                    return `#path-${d.source.index}-${d.target.index}`;
                })
                .text(function(d) {
                    if (d.text) {
                        return d.text;
                    }
                })
                .attr('startOffset', '50%') // 文字在线条上居中显示
                .attr('text-anchor', 'middle');
            pathText.exit().remove();

            let nodeEnter = node.data(nodes)
                .enter()
                .append('g')
                .attr('class', 'node')
                .attr('transform', function(d) {
                    return 'translate(' + d.x + ',' + d.y + ')';
                })
                .call(force.drag)
                .each(e => {});

            let circle = nodeEnter
                .append('circle')
                .attr('r', 12)
                .attr('class', 'node') // 增加class
                .call(force.drag);

            let image = nodeEnter
                .append('image')
                .attr('xlink:href', d => _this.image.boat)
                .attr('class', 'img')
                .attr('x', '-12px')
                .attr('y', '-12px')
                .attr('width', '24px')
                .attr('height', '24px');

            let text = nodeEnter
                .append('text')
                .attr('x', 15)
                .attr('y', '.31em')
                .text(function(d) {
                    return d.name;
                });

            // path = svg.selectAll('path.link');
            // pathOutline = svg.selectAll('path.link-outline');
            node = svg.selectAll('g.node');
            force.start();
        }

        let drag = force.drag().on('dragend', dragend);
        function dragend(d) {
            d3.select(this).classed('fixed', (d.fixed = true)); // 把点固定
        }

        function linkArc(d) {
            let dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
            return ('M' + d.source.x + ',' + d.source.y + 'A' + dr + ',' + dr + ' 0 0,1 ' + d.target.x + ',' + d.target.y);
        }
        function transform(d) {
            return 'translate(' + d.x + ',' + d.y + ')';
        }
        function tick() {
            pathOutline.attr('d', linkArc);
            path.attr('d', linkArc);
            node.attr('transform', transform);
        }

        addLinks();

        // 给节点新增点击事件
        // 单击
        svg.selectAll('g.node').on('click', function(d) {
            if (d3.event.defaultPrevented) return;
            d3.select(this).classed('fixed', (d.fixed = false)); // 把点释放固定
            d3.select(this).classed('highlight', (d.highlight = true)); // 把高亮自身

            if (!_this.checkedNode) {
                _this.checkedNode = {
                    d: d,
                    _this: this
                };
            } else {
                if (window.confirm('确认连线?')) {
                    links.push({
                        type: 'suit',
                        source: _this.checkedNode.d,
                        target: d
                    });

                    // 更新数据
                    addLinks();

                    // 取消高亮
                    _this.checkedNode.highlight = false;
                    d3.select(_this.checkedNode._this).classed('highlight', false);
                    _this.checkedNode = null;

                    d.highlight = false;
                    d3.select(this).classed('highlight', false);
                } else {
                    // 取消高亮
                    _this.checkedNode.highlight = false;
                    d3.select(_this.checkedNode._this).classed('highlight', false);
                    _this.checkedNode = null;

                    d.highlight = false;
                    d3.select(this).classed('highlight', false);
                }
            }
        });

        svg.selectAll('path.link-outline').on('mouseenter', function(d) {
            svg.select(`path#path-${d.source.index}-${d.target.index}`).classed('highlight', true);
        });
        svg.selectAll('path.link-outline').on('mouseleave', function(d) {
            svg.select(`path#path-${d.source.index}-${d.target.index}`).classed('highlight', false);
        });
        svg.selectAll('path.link-outline').on('contextmenu', function(d) {
            console.log('右键点击');
        });
    }

    // ngAfterContentInit() {
    //     let width = document.body.offsetWidth,
    //         height = document.body.offsetHeight;

    //     d3.select('body')
    //         .on('touchstart', nozoom)
    //         .on('touchmove', nozoom);

    //     function nozoom() {
    //         d3.event.preventDefault(); // 阻止默认事件
    //     }

    //     let force = d3.layout
    //         .force()
    //         .nodes(d3.values(this.nodes))
    //         .links(this.links)
    //         .size([width, height])
    //         .linkDistance(150)
    //         .charge(-300)
    //         .on('tick', tick)
    //         .start();

    //     let drag = force.drag().on('dragend', dragend);

    //     let svg = d3
    //         .select('body')
    //         .append('svg')
    //         .attr('width', width)
    //         .attr('height', height);

    //     svg.append('defs')
    //         .selectAll('marker')
    //         .data(['suit', 'licensing', 'resolved'])
    //         .enter()
    //         .append('marker')
    //         .attr('id', function(d) {
    //             return d;
    //         })
    //         .attr('viewBox', '0 -5 10 10')
    //         .attr('refX', 23) // 可以调整箭头距离目标的位置
    //         .attr('refY', -1.5)
    //         .attr('markerWidth', 9)
    //         .attr('markerHeight', 9)
    //         .attr('orient', 'auto')
    //         .append('path')
    //         .attr('d', 'M0,-5L10,0L0,5');

    //     let path = svg
    //         .append('g')
    //         .selectAll('path')
    //         .data(force.links())
    //         .enter()
    //         .append('path')
    //         .attr('id', function(d) {
    //             return `path-${d.source.index}-${d.target.index}`;
    //         })
    //         .attr('class', function(d) {
    //             return 'link ' + d.type;
    //         })
    //         .attr('marker-end', function(d) {
    //             return 'url(#' + d.type + ')';
    //         });

    //     let pathOutline = svg
    //         .append('g')
    //         .selectAll('path')
    //         .data(force.links())
    //         .enter()
    //         .append('path')
    //         .attr('id', function(d) {
    //             return `pathOutline-${d.source.index}-${d.target.index}`;
    //         })
    //         .attr('class', function(d) {
    //             return 'link-outline ' + d.type;
    //         });

    //     let pathText = svg
    //         .append('g')
    //         .selectAll('text')
    //         .data(force.links())
    //         .enter()
    //         .append('text')
    //         .style('font-size', '10px')
    //         .attr('dy', '-5px') // 文字和线条的距离
    //         .append('textPath')
    //         .attr('xlink:href', function(d) {
    //             return `#path-${d.source.index}-${d.target.index}`;
    //         })
    //         .text(function(d) {
    //             if (d.text) {
    //                 return d.text;
    //             }
    //         })
    //         .attr('startOffset', '50%') // 文字在线条上居中显示
    //         .attr('text-anchor', 'middle');

    //     let node = svg.selectAll('g.node').data(force.nodes());

    //     let nodeEnter = node
    //         .enter()
    //         .append('g')
    //         .attr('class', 'node')
    //         .attr('transform', function(d) {
    //             return 'translate(' + d.x + ',' + d.y + ')';
    //         })
    //         .call(force.drag)
    //         .each(e => {});

    //     let circle = nodeEnter
    //         .append('circle')
    //         .attr('r', 12)
    //         .attr('class', 'node') // 增加class
    //         .call(force.drag);

    //     let image = nodeEnter
    //         .append('image')
    //         .attr('xlink:href', d => this.image.boat)
    //         .attr('class', 'img')
    //         .attr('x', '-12px')
    //         .attr('y', '-12px')
    //         .attr('width', '24px')
    //         .attr('height', '24px');

    //     let text = nodeEnter
    //         .append('text')
    //         .attr('x', 15)
    //         .attr('y', '.31em')
    //         .text(function(d) {
    //             return d.name;
    //         });

    //     // Use elliptical arc path segments to doubly-encode directionality.
    //     function tick() {
    //         pathOutline.attr('d', linkArc);
    //         path.attr('d', linkArc);
    //         node.attr('transform', transform);
    //     }

    //     function linkArc(d) {
    //         let dx = d.target.x - d.source.x,
    //             dy = d.target.y - d.source.y,
    //             dr = Math.sqrt(dx * dx + dy * dy);
    //         return ('M' + d.source.x + ',' + d.source.y + 'A' + dr + ',' + dr + ' 0 0,1 ' + d.target.x + ',' + d.target.y);
    //     }

    //     function transform(d) {
    //         return 'translate(' + d.x + ',' + d.y + ')';
    //     }



    //     function dragend(d) {
    //         d3.select(this).classed('fixed', (d.fixed = true)); // 把点固定
    //     }

    //     let _this = this; // 暂存this

    //     // 给节点新增点击事件
    //     // 单击
    //     svg.selectAll('g.node').on('click', function(d) {
    //         if (d3.event.defaultPrevented) return;
    //         d3.select(this).classed('fixed', (d.fixed = false)); // 把点释放固定
    //         d3.select(this).classed('highlight', (d.highlight = true)); // 把高亮自身

    //         if (!_this.checkedNode) {
    //             _this.checkedNode = d;
    //         } else {
    //             if (window.confirm('确认连线?')) {
    //                 console.log(_this.checkedNode);
    //                 console.log(d);
    //                 console.log(_this.links);
    //                 _this.links.push({
    //                     type: 'suit',
    //                     source: {
    //                         name: _this.checkedNode.name
    //                     },
    //                     target: {
    //                         name: d.name
    //                     }
    //                 });
    //             }
    //         }
    //     });

    //     svg.selectAll('path.link-outline').on('mouseenter', function(d) {
    //         svg.select(`path#path-${d.source.index}-${d.target.index}`).classed('highlight', true);
    //     });
    //     svg.selectAll('path.link-outline').on('mouseleave', function(d) {
    //         svg.select(`path#path-${d.source.index}-${d.target.index}`).classed('highlight', false);
    //     });
    //     svg.selectAll('path.link-outline').on('contextmenu', function(d) {
    //         console.log('右键点击');
    //     });
    // }
}
