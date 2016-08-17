(function(jQuery) {

  var $ = jQuery;

  var EXAMPLE_URL = "/lis_context_viewer/index.html#/search/lis/phavu.Phvul.002G085200?numNeighbors=10&numMatchedFamilies=4&numNonFamily=5&algorithm=repeat&match=10&mismatch=-1&gap=-1&score=30&threshold=25&track_regexp=&order=distance&sources=lis";

  function inContextViewer() {
    return document.location.href.indexOf('lis_context_viewer') !== -1;
  }
  function inBasicMode() {
    return document.location.hash.indexOf('/basic') !== -1;
  }
  function inSearchMode() {
    return document.location.hash.indexOf('/search') !== -1;
  }
  
  var tour = new Tour({

    name: 'genome-context-viewer',
    debug: true,
    orphan: true,
    template: lisTours.template.noPrevBtnTemplate,
    steps: [{
      /* First, check if the user is in the context viewer in the
      basic view, and if so, prompt them to be redirected to the
      search view. Dont want to abruptly yank them out from one view
      to another. */
      title: 'Please note',
      content: 'To view the Context Viewer help and interactive tour, you will be redirected to an example Search view, instead of the Basic view. Please press the <strong>Next</strong> button to continue, or <strong>End Tour</strong> button to stay on the current Basic view.',
      onShown: function(tour) {
        if(! inContextViewer()) {
          tour.next();
        }
        else if(inSearchMode()) {
          tour.next();
        }
        // else let the 1st step display to warn user.
      },
    }, {
      /* Second, confirm that we are currently in the context viewer,
	 and if not, redirect browser to example url. */
      title: 'Loading',
      content: 'Please wait...',
      onShown: function(tour) {
        if(inBasicMode() || ! inContextViewer()) {
          if(tour._options.debug) {
            console.log('redirecting to example focus gene : '+ EXAMPLE_URL);
          }
          tour.next();
          document.location.href = EXAMPLE_URL;
          return (new jQuery.Deferred()).promise();
        }
        else {
          tour.next();
        }
      }
    }, {
      // now start the actual tour!
      title: 'Welcome',
      content: 'This quick tour will acquaint you with the genome context viewer application, which is useful for exploring microsynteny relationships among sets of genomic segments. Use the Next button or &#8594; (right arrow key) to advance the tour. Use the Prev button or &#8592; (left arrow key) to step back.'
    }, {
      title: "Context Viewer",
      content: "The context viewer displays corresponding regions around a selected gene or set of genes in a subtree. It makes it easy to find functional gene groups as well as help make hypotheses about their evolutionary histories. Gene glyphs have mouse over and click interactivity. If a glyph is moused over its name and genomic position are shown. If a gene is clicked a widget will appear with a variety of links related to the gene, such as a link to the source of the gene annotation. The thicker the connecting line between the genes, the longer the intergenic distance on the chromosome; intergenic distances and gene identities for tracks can also be displayed by mousing over the track labels to the left of the tracks.",
      element: "path.point.focus:first",
      placement: "left",
    }, {
      title: "Gene Families: Legend",
      content: "Each gene in a Context View is colored by the gene family it belongs to as indicated in the legend (genes belonging to families with no other representatives in a view are left uncolored, while genes not belonging to families are uncolored and have dotted outlines). In the case where a single gene is used to invoke the viewer, that gene's context track will be used as a query to find other tracks annotated with similar gene family content in the database. If a set of genes from a gene family was used to request a view, these genes will be centered in each context but no alignment of the tracks will be performed.",
      element: "#legend",
      placement: "left",
      onShow: function() {
        $('#legend').animate({
          scrollTop: 400
        }, 3000);
        $('#legend').animate({
          scrollTop: 100
        }, 3000);
      }
    }, {
      title: "Gene Families",
      content: "Since genes in a family tend to have relatively similar sequences, we can use them to predict the functions of newly identified genes based on their relations to other known genes, especially in cases where the genes are found in similar syntenic contexts. Gene family colors in the legend will display all representatives of the family in the current view when moused-over, or when clicked will list those genes with the option to view them in the context of the family's phylogenetic tree. ",
      element: "#legend",
      placement: "left"
    }, {
      title: "Dot Plots",
      content: "Dot plots are useful in identifying interspersed, lost, or gained repeat motifs. The <strong>plot</strong> link reveals the dot plot for the given genome track against the query track. (If you cannot see the <strong>plot</strong> plot links, maximize your browser window)",
      element: ".axis_right",
      placement: "top",
      multipage: true,
      reflex: true,
      onNext: function() {
        $.fn.d3Click = function () {
          this.each(function (i, e) {
            var evt = new MouseEvent('click');
            e.dispatchEvent(evt);
          });
        };
        $('.axis_right text:first').d3Click();    
        return lisTours.waitForContent(
          tour,
          function() {
            return $("#plot")[0];
          });
      }
    }, {
      title: "The Plot Thickens",
      content: "The main diagonal shows the sequence's alignment with itself, while patterns off the main diagonal indicate structural similarities among different parts of the sequences. Lines off the main diagonal imply different regions with a high similarity.", 
      element: "#local-plot",
      placement: "left",
      onNext: function() {
        $('#gloplot')[0].click();
        $.fn.d3Click = function () {
          this.each(function (i, e) {
            var evt = new MouseEvent('click');
            e.dispatchEvent(evt);
          });
        };
        $('.axis_right text:first').d3Click();
        return lisTours.waitForContent(
          tour,
          function() {
            return $("#global-plot")[0];
          });
      }
    }, {   
      title: "Global Plots",
      content: "Just like the local plot but instead of focusing only on the matched syntenic segment, the global plot displays all instances of genes from the families of the query track in across the chromosome from which the matched syntenic segment was taken. This gives a better sense for the frequency with which members of these families occur outside the matched context and can reveal wider syntenic properties.",
      element: "#global-plot",
      placement: "left"
    }, {  
      title: "Parameters",
      content: "These parameters allow you to fine-tune the candidate tracks retrieved and the alignments produced from them.",
      element: "#parambtn",    
      placement: "bottom",
      onNext: function() {
        $('#parambtn')[0].click();
        if (! $('#left-slider').is(':visible')) {
        }
      }
    }, {
      title: "Neighbors",
      content: "The 'Neighbor' value controls the number of genes that surround the central gene. By default, the regions extend out by 8 genes upstream and down from the selected genes. Increasing this value will give you longer contexts with more sensitivity for finding distant matches, but will increase retrieval times and may make the display harder to interpret.",
      element: "#neighborpane", //Should point to the field input, but depends on the size/shape of the window.
      placement: "right",       
      onShow: function() {
        $('#left-slider-content').animate({
          //not sure why the offset this gives is not what we want
          //scrollTop: $("#neighborpane").offset().top
          scrollTop: 0
        }, 1);
      }
    }, {
      title: "Scroll Control",
      content: "The scroll input is used to scroll in either direction on the query track's chromosome. In other words, given a scroll distance and direction from the current focus gene, a new query is made with the track built around the new focus found with these parameters. The allowed scroll values are constrained so that the new focus gene after scrolling is present in the context before scrolling.",
      element: "#form-wrapper",
      placement: "right",
    }, {
      title: "Algorithms",
      content: "Synteny between tracks is determined via a modified Smith-Waterman or Repeat alignment algorithm. For Smith-Waterman, the orientation (forward/reverse) with the higher score is displayed. For the Repeat algorithm, all alignments are kept and displayed as related tracks. This has the advantage of nicely capturing inversions.",
      element: "#algpar",
      placement: "right",
      onShow: function() {
        $('#left-slider-content').animate({
          //not sure why the offset this gives is not what we want
          //scrollTop: $("#algpar").offset().top
          scrollTop: 400
        }, 1);
      }
    }, {
      title: "Alerts",
      content: "A context search is performed by querying a database for tracks with similar gene family content to a query track. The result tracks found are then aligned to the query track using alignment based on common family memberships. The search view displays the query track and the alignments that meet the specified alignment criteria. If the number of tracks returned exceeds the number aligned, you may consider altering the Alignment Parameters to see if you are missing out on some more complex syntenic relationships.",
      element: "#alerts",
      placement: "bottom",
      arrowOffset: "center"
    }, {
      title: 'Context Viewer Tour: Completed',
      content: 'Congratulations, you have finished the Context Viewer Tour! Now press End Tour.',
    }
  ]
  });

  lisTours.register(tour);

}(window.__jquery));

