// Canvas from which you take shapes
var stencilGraph = new joint.dia.Graph;
var stencilPaper = new joint.dia.Paper({
    el: $('#stencil'),
    model: stencilGraph,
    interactive: false,
    width:327
  });

// Canvas where sape are dropped
var graph = new joint.dia.Graph;
var paper = new joint.dia.Paper({
    el: $('#paper'),
    model: graph,
    width:940
  });


//customize Element
joint.shapes.html = {};
joint.shapes.html.Element = joint.shapes.basic.Rect.extend({
    defaults: joint.util.deepSupplement({
        type: 'html.Element',
        attrs: {
            rect: { stroke: 'none', 'fill-opacity': 0 }
        }
    }, joint.shapes.basic.Rect.prototype.defaults)
});

joint.shapes.html.ElementView = joint.dia.ElementView.extend({
  template: [
      '<div class="html-element">',
      '<img src="" class="small_img" height="20px" width="20px"></img>',
      '<a class="small_label"></a>',
      '</div>'
  ].join(''),

  initialize: function() {
      _.bindAll(this, 'updateBox');
      joint.dia.ElementView.prototype.initialize.apply(this, arguments);
      this.$box = $(_.template(this.template)());
      this.model.on('change', this.updateBox, this);
      this.updateBox();
  },
  render: function() {
      joint.dia.ElementView.prototype.render.apply(this, arguments);
      this.paper.$el.prepend(this.$box);
      this.updateBox();
      return this;
  },
  updateBox: function() {
      // Set the position and dimension of the box so that it covers the JointJS element.
      var bbox = this.model.getBBox();
      // Example of updating the HTML with a data stored in the cell model.
      this.$box.find('a').text(this.model.get('label'));
      this.$box.find('img')[0].attributes.src.nodeValue = this.model.get('imgSrc');
      this.$box.css({
          width: bbox.width,
          height: bbox.height,
          left: bbox.x,
          top: bbox.y,
          transform: 'rotate(' + (this.model.get('angle') || 0) + 'deg)'
      });
    }
});

var image = new joint.shapes.html.Element({
    position: { x: 20, y: 10 },
    size: { width: 290, height: 40 },
    label: 'Image',
    imgSrc: 'img/images.png'
});
var compute = new joint.shapes.html.Element({
    position: { x: 20, y: 60 },
    size: { width: 290, height: 40 },
    label: 'Compute',
    imgSrc: 'img/small-business.png',
});
var storage = new joint.shapes.html.Element({
  position: { x: 20, y: 110 },
  size: { width: 290, height: 40 },
  label: 'Storage',
  imgSrc: 'img/small-lens.png',
});
var services = new joint.shapes.html.Element({
  position: { x: 20, y: 160 },
  size: { width: 290, height: 40 },
  label: 'Services',
  imgSrc: 'img/open-laptop-computer.png',
});
var environment = new joint.shapes.html.Element({
  position: { x: 20, y: 210 },
  size: { width: 290, height: 40 },
  label: 'Environment',
  imgSrc: 'img/small-house-with-chimney.png',
});
var servicePorts = new joint.shapes.html.Element({
  position: { x: 20, y: 260 },
  size: { width: 290, height: 40 },
  label: 'Service Ports',
  imgSrc: 'img/small-clock.png',
});
stencilGraph.addCells([image, compute, storage, services, environment, servicePorts]);

// link on drop elements
paper.on({
  'element:pointerdown': function(elementView, evt) {
      evt.data = elementView.model.position();
  },
  'element:pointerup': function(elementView, evt, x, y) {
      var coordinates = new g.Point(x, y);
      var elementAbove = elementView.model;
      var elementBelow = this.model.findModelsFromPoint(coordinates).find(function(el) {
          return (el.id !== elementAbove.id);
      });

      // If the two elements are connected already, don't
      // connect them again (this is application-specific though).
      if (elementBelow && graph.getNeighbors(elementBelow).indexOf(elementAbove) === -1) {

          // Move the element to the position before dragging.
          elementAbove.position(evt.data.x, evt.data.y);

          // Create a connection between elements.
          var link = new joint.shapes.standard.Link();
          link.source(elementAbove);
          link.target(elementBelow);
          link.addTo(graph);

          var verticesTool = new joint.linkTools.Vertices();
          var segmentsTool = new joint.linkTools.Segments();
          var sourceArrowheadTool = new joint.linkTools.SourceArrowhead();
          var targetArrowheadTool = new joint.linkTools.TargetArrowhead();
          var sourceAnchorTool = new joint.linkTools.SourceAnchor();
          var targetAnchorTool = new joint.linkTools.TargetAnchor();
          var boundaryTool = new joint.linkTools.Boundary();
          var removeButton = new joint.linkTools.Remove({
              distance: 20
          });
      
          var toolsView = new joint.dia.ToolsView({
              tools: [
                  verticesTool, segmentsTool,
                  sourceArrowheadTool, targetArrowheadTool,
                  sourceAnchorTool, targetAnchorTool,
                  boundaryTool, removeButton
              ]
          });
      
          var linkView = link.findView(paper);
          linkView.addTools(toolsView);
          linkView.hideTools();
      
          paper.on('link:mouseenter', function(linkView) {
              linkView.showTools();
          });
      
          paper.on('link:mouseleave', function(linkView) {
              linkView.hideTools();
          });
      }
  }
});

paper.on('cell:pointerclick', function(cellView, e, x, y) {
  $('#stencil').hide();
  $('#form').show();
  var label = cellView.$box[0].children[2].children[0].innerText + ' Details';
  $('.form-label').text(label);
  
});

function closeForm(){
  $('#stencil').show();
  $('#form').hide();
}

stencilPaper.on('cell:pointerdown', function(cellView, e, x, y) {
  $('body').append('<div id="flyPaper" style="position:fixed;z-index:100;opacity:.7;pointer-event:none;"></div>');
  var flyGraph = new joint.dia.Graph;
  var flyPaper = new joint.dia.Paper({
      el: $('#flyPaper'),
      model: flyGraph,
      interactive: false,
      width:100,
      height:100
    }),
    flyShape = cellView.model.clone(),
    pos = cellView.model.position(),
    offset = {
      x: x - pos.x,
      y: y - pos.y
    };

    joint.shapes.html = {};
    joint.shapes.html.Element = joint.shapes.basic.Rect.extend({
        defaults: joint.util.deepSupplement({
            type: 'html.Element',
            attrs: {
                rect: { stroke: 'none', 'fill-opacity': 0 }
            }
        }, joint.shapes.basic.Rect.prototype.defaults)
    });
    
    joint.shapes.html.ElementView = joint.dia.ElementView.extend({
      template: [
          '<div class="html-element">',
          '<button class="delete">x</button>',
          '<div class="big_img_div">',
          '<img src="" class="big_img" height="40px" width="40px"></img>',
          '</div>',
          '<div class="big_label_div">',
          '<a class="big_label"></a>',
          '</div>',
          '</div>'
      ].join(''),
    
      initialize: function() {
          _.bindAll(this, 'updateBox');
          joint.dia.ElementView.prototype.initialize.apply(this, arguments);
          this.$box = $(_.template(this.template)());
          this.$box.find('.delete').on('click', _.bind(this.model.remove, this.model));
          this.model.on('change', this.updateBox, this);
          this.model.on('remove', this.removeBox, this);
          this.updateBox();
      },
      render: function() {
          joint.dia.ElementView.prototype.render.apply(this, arguments);
          this.paper.$el.prepend(this.$box);
          this.updateBox();
          return this;
      },
      updateBox: function() {
          // Set the position and dimension of the box so that it covers the JointJS element.
          var bbox = this.model.getBBox();
          // Example of updating the HTML with a data stored in the cell model.
          this.$box.find('a').text(cellView.model.attributes.label);
          this.$box.find('img')[0].attributes.src.nodeValue = cellView.model.attributes.imgSrc;
          this.$box.css({
              width: bbox.width,
              height: bbox.height,
              left: bbox.x,
              top: bbox.y,
              transform: 'rotate(' + (this.model.get('angle') || 0) + 'deg)'
          });
        },
        removeBox: function(evt) {
          this.$box.remove();
      }
    });
  
    var el3 = new joint.shapes.html.Element({
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
        label: 'Storage',
        imgSrc: 'img/small-lens.png'
    });
    
    // el3.addPort({ attrs: { circle: { magnet: true } } });
    // el3.addPort(port)
  flyShape.position(0, 0);
  flyGraph.addCell(el3);
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
    var x = e.pageX,
      y = e.pageY,
      target = paper.$el.offset();
    
    // Dropped over paper ?
    if (x > target.left && x < target.left + paper.$el.width() && y > target.top && y < target.top + paper.$el.height()) {
      var s = el3.clone();
      s.position(x - target.left - offset.x, y - target.top - offset.y);
      graph.addCell(s);
    }
    $('body').off('mousemove.fly').off('mouseup.fly');
    el3.remove();
    $('#flyPaper').remove();
  });
});