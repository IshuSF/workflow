import { Component, OnInit } from '@angular/core';
const joint = require('jointjs/dist/joint.js');
import * as _ from "lodash"
import * as $ from "jquery";

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.css', './../../../node_modules/jointjs/dist/joint.css']
})
export class WorkflowComponent implements OnInit {

  ngOnInit(): void {
    // Canvas from which you take shapes
    let stencilGraph = new joint.dia.Graph;
    let stencilPaper = this.getStencilPaper(stencilGraph);
    // stencilPaper.setDimensions("100%", "100%");

    //customize Element
    joint.shapes.html = {};
    joint.shapes.html.Element = WorkflowComponent.getHtmlElement();
    joint.shapes.html.ElementView = this.getHtmlElementView();
    this.addElementsToStencilGraph(stencilGraph);

    // Canvas where sape are dropped
    let graph = new joint.dia.Graph;
    let defaultLink = this.getDefaultLink();
    let paper = this.getPaper(graph);
    paper.options.defaultLink = defaultLink;
    this.handleEvents(graph, paper);

    this.addPointerDownEventOnStencilPaper(graph, paper, stencilPaper);
  }

  getStencilPaper(stencilGraph){
    return new joint.dia.Paper({
      el: $('#stencil'),
      model: stencilGraph,
      interactive: false,
      width: "100%",
      cellViewNamespace: joint.shapes,
    });
  }

  getDefaultLink(){
    let link = new joint.shapes.standard.Link();
    link.attr({
      line: {
        strokeWidth: 2,
        sourceMarker: {
          'type': 'path',
          'stroke': 'black',
        },
        targetMarker: {
          'type': 'path',
          'stroke': 'black',
          'd': 'M 10 -5 0 0 10 5 Z'
        }
      },
    });
   
    // link.router('oneSide', {
    //   side: 'top'
    // });
    // link.router('metro');
    link.router('manhattan', {});
    // link.router('manhattan', {startDirections: ['top'],});
    // link.connector('rounded');
    return link;
  }

  handleEvents(graph, paper){
    this.onLinkConnect(paper);
    this.onLinkRelease(paper);
    this.linkOnDropElements(graph, paper);
    this.addClickEventOnElements(paper);
  }

  getPaper(graph){
    return new joint.dia.Paper({
      el: $('#paper'),
      model: graph,
      width: "100%",
      cellViewNamespace: joint.shapes,
    });
  }

  static getHtmlElement(){
    return joint.shapes.basic.Rect.extend({
      defaults: joint.util.deepSupplement({
          type: 'html.Element',
          attrs: {
              rect: { stroke: 'none' }
          }
      }, joint.shapes.basic.Rect.prototype.defaults)
    });
  }

  getHtmlElementView(){
    return joint.dia.ElementView.extend({
      template: [
        '<div style="border: 1px solid black;position: absolute;background: white;pointer-events: none;-webkit-user-select: none;z-index: 2;" class="html-element">',
        '<img src="" style="margin:10px;float:left;" class="small_img" height="20px" width="20px"></img>',
        '<a style="float:left;margin-top:10px;color:black;" class="small_label"></a>',
        '</div>'
      ].join(''),

      initialize: function() {
        joint.dia.ElementView.prototype.initialize.apply(this, arguments);
        this.$box = $(_.template(this.template)());
      },
      render: function() {
        joint.dia.ElementView.prototype.render.apply(this, arguments);
        this.paper.$el.prepend(this.$box);
        this.updateBox();
      },
      updateBox: function() {
        // Set the position and dimension of the box so that it covers the JointJS element.
        let bbox = this.model.getBBox();
        // Example of updating the HTML with a data stored in the cell model.
        this.$box.find('a').text(this.model.get('label'));
        this.$box.find('img')[0].attributes.src.nodeValue = this.model.get('imgSrc');
        this.$box.css({
          width: bbox.width,
          height: bbox.height,
          left: bbox.x,
          top: bbox.y,
        });
      }
    });
  }

  addElementsToStencilGraph(stencilGraph){
    let role = new joint.shapes.html.Element({
      position: { x: 20, y: 10 },
      size: { width: 260, height: 40 },
      label: 'Role',
      imgSrc: './assets/small-clock.png'
    });
    let image = new joint.shapes.html.Element({
        position: { x: 20, y: 60 },
        size: { width: 260, height: 40 },
        label: 'Image',
        imgSrc: './assets/images.png'
    });
    let compute = new joint.shapes.html.Element({
        position: { x: 20, y: 110 },
        size: { width: 260, height: 40 },
        label: 'Compute',
        imgSrc: './assets/small-business.png',
    });
    let storage = new joint.shapes.html.Element({
      position: { x: 20, y: 160 },
      size: { width: 260, height: 40 },
      label: 'Storage',
      imgSrc: './assets/small-lens.png',
    });
    let services = new joint.shapes.html.Element({
      position: { x: 20, y: 210 },
      size: { width: 260, height: 40 },
      label: 'Services',
      imgSrc: './assets/open-laptop-computer.png',
    });
    let environment = new joint.shapes.html.Element({
      position: { x: 20, y: 260 },
      size: { width: 260, height: 40 },
      label: 'Environment',
      imgSrc: './assets/small-house-with-chimney.png',
    });
    let servicePorts = new joint.shapes.html.Element({
      position: { x: 20, y: 310 },
      size: { width: 260, height: 40 },
      label: 'Service Ports',
      imgSrc: './assets/small-clock.png',
    });
    stencilGraph.addCells([role, image, compute, storage, services, environment, servicePorts]);
  }

  static setLinktool(linkView, paper){
    let verticesTool = new joint.linkTools.Vertices();
    let segmentsTool = new joint.linkTools.Segments();
    let sourceArrowheadTool = new joint.linkTools.SourceArrowhead();
    let targetArrowheadTool = new joint.linkTools.TargetArrowhead();
    let sourceAnchorTool = new joint.linkTools.SourceAnchor();
    let targetAnchorTool = new joint.linkTools.TargetAnchor();
    let boundaryTool = new joint.linkTools.Boundary();
    let removeButton = new joint.linkTools.Remove({distance: -50});

    let toolsView = new joint.dia.ToolsView({
      tools: [
        verticesTool, segmentsTool,
        sourceArrowheadTool, targetArrowheadTool,
        sourceAnchorTool, targetAnchorTool,
        boundaryTool, removeButton
      ]
    });

    linkView.addTools(toolsView);
    linkView.hideTools();

    paper.on('link:mouseenter', function(linkView) {
        linkView.showTools();
    });
    paper.on('link:mouseleave', function(linkView) {
        linkView.hideTools();
    });
  }

  onLinkRelease(paper){
    paper.on('link:pointerup', function(cellView) {
      var linkView = paper.findViewByModel(cellView.model);
      WorkflowComponent.setLinktool(linkView, paper);
    });
  }
  onLinkConnect(paper){
    paper.on('link:connect', function(linkView) {
      WorkflowComponent.setLinktool(linkView, paper);
    });
  }

  linkOnDropElements(graph, paper){
    paper.on({
      'element:pointerdown': function(elementView, evt) {
          evt.data = elementView.model.position();
      },
      'element:pointerup': function(elementView, evt, x, y) {
        let coordinates = new joint.g.Point(x, y);
        let elementAbove = elementView.model;
        let elementBelow = this.model.findModelsFromPoint(coordinates).find(function(el) {
            return (el.id !== elementAbove.id);
        });
        // If the two elements are connected already, don't
        // connect them again (this is application-specific though).
        if (elementBelow && graph.getNeighbors(elementBelow).indexOf(elementAbove) === -1) {
          // Move the element to the position before dragging.
          elementAbove.position(evt.data.x, evt.data.y);
          // Create a connection between elements.
          let link = new joint.shapes.standard.Link();
          link.source(elementAbove);
          link.target(elementBelow);
          link.addTo(graph);
          link.router('manhattan', {});
          link.connector('rounded');
          let linkView = link.findView(paper);
          WorkflowComponent.setLinktool(linkView, paper);
        }
      }
    });
  }

  addClickEventOnElements(paper){
    paper.on('element:pointerclick', function(cellView) {
      $('#stencil').hide();
      $('#form').show();
      $('.form-label').text(cellView.$box[0].children[2].children[0].innerText);
    });
  }

  closeForm = () => {
    $('#stencil').show();
    $('#form').hide();
  }

  addPointerDownEventOnStencilPaper(graph, paper, stencilPaper){
    stencilPaper.on('cell:pointerdown', function(cellView, e, x, y) {
      $('body').append('<div id="flyPaper" style="position:fixed;z-index:100;opacity:.7;pointer-event:none;"></div>');
      let flyGraph = new joint.dia.Graph;
      let flyPaper = getFlyPaper(flyGraph);
      let flyShape = cellView.model.clone();
      let pos = cellView.model.position();
      let offset = {
        x: x - pos.x,
        y: y - pos.y
      };

      joint.shapes.html = {};
      joint.shapes.html.Element = WorkflowComponent.getHtmlElement();
      joint.shapes.html.ElementView = getFlyGraphElementView(cellView);
      let flyGrahElement = getFlyGraphElement();
      flyShape.position(0, 0);
      flyGraph.addCell(flyGrahElement);

      $("#flyPaper").offset({
        left: e.pageX - offset.x,
        top: e.pageY - offset.y
      });
      $('body').on('mousemove.fly', function(e) {
        $("#flyPaper").offset({
          left: e.pageX - offset.x,
          top: e.pageY - offset.y
        });
      });
      $('body').on('mouseup.fly', function(e) {
        let x = e.pageX;
        let y = e.pageY;
        let target = paper.$el.offset();
        
        // Dropped over paper ?
        if (x > target.left && x < target.left + paper.$el.width() && y > target.top && y < target.top + paper.$el.height()) {
          let s = flyGrahElement.clone();
          s.position(x - target.left - offset.x, y - target.top - offset.y);
          graph.addCell(s);
        }
        $('body').off('mousemove.fly').off('mouseup.fly');
        flyGrahElement.remove();
        $('#flyPaper').remove();
      });
    });

    let getFlyPaper = (flyGraph) => {
      return new joint.dia.Paper({
        el: $('#flyPaper'),
        model: flyGraph,
        interactive: false,
        width:100,
        height:100,
        cellViewNamespace: joint.shapes
      });
    }

    let getFlyGraphHtmlElement = () => {
      return joint.shapes.basic.Rect.extend({
        defaults: joint.util.deepSupplement({
            type: 'html.Element',
            attrs: {
                rect: { stroke: 'none' }
            }
        }, joint.shapes.basic.Rect.prototype.defaults)
      });
    }

    let getFlyGraphElementView = (cellView) => {
      return joint.dia.ElementView.extend({
        template: [
          '<div style="border: 1px solid black;position: absolute;background: white;pointer-events: none;-webkit-user-select: none;z-index: 2;" class="html-element2">',
          '<button style="pointer-events:auto;color: white;border: none;background-color: #C0392B;border-radius: 20px;width: 15px;height: 15px;line-height: 15px;text-align: middle;position: absolute;top: -15px;left: -15px;padding: 0;margin: 0;font-weight: bold;cursor: pointer;" class="delete">x</button>',
          '<div style="height:80%;" class="big_img_div">',
          '<img src="" style=" margin-left: 30px;margin-top: 14px;margin-bottom: 24px;" class="big_img" height="40px" width="40px"></img>',
          '</div>',
          '<div style="height:20%;background:blue;text-align: center;" class="big_label_div">',
          '<a style="color:white;" class="big_label"></a>',
          '</div>',
          '</div>'
        ].join(''),

        initialize: function() {
          joint.dia.ElementView.prototype.initialize.apply(this, arguments);
          this.$box = $(_.template(this.template)());
          this.$box.find('.delete').on('click', _.bind(this.model.remove, this.model));
          this.model.on('change', this.updateBox, this);
          this.model.on('remove', this.removeBox, this);
        },
        render: function() {
          joint.dia.ElementView.prototype.render.apply(this, arguments);
          this.paper.$el.prepend(this.$box);
          this.updateBox();
        },
        updateBox: function() {
          // Set the position and dimension of the box so that it covers the JointJS element.
          let bbox = this.model.getBBox();
          // Example of updating the HTML with a data stored in the cell model.
          this.$box.find('a').text(cellView.model.attributes.label);
          this.$box.find('img')[0].attributes.src.nodeValue = cellView.model.attributes.imgSrc;
          this.$box.css({
            width: bbox.width,
            height: bbox.height,
            left: bbox.x,
            top: bbox.y
          });
        },
        removeBox: function(evt) {
          this.$box.remove();
        }
      });
    }
    
    let getFlyGraphElement = () => {
      return new joint.shapes.html.Element({
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
        label: 'Storage',
        imgSrc: './assets/small-lens.png',
        ports: {
          groups: {
            'in': {
              position: {
                  name: 'top',
                  args: { dr: 0, dx: 0, dy: -9 }
              },
              attrs: { circle: { magnet: true }}
            },
            'out': {
              position: {
                  name: 'bottom',
                  args: { dr: 0, dx: 0, dy: -9 }
              },
              attrs: { circle: { magnet: true }}
            }
          },
          items: [
            { group: 'in', args: { y: 0}, id: 'portTop'},
            { group: 'out', args: { y: 102}, id: 'portBottom'}
          ]
        }
      });
    }
  }
}
