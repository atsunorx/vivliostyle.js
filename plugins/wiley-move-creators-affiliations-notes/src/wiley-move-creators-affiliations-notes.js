vivliostyle.plugin.registerHook("PREPROCESS_SINGLE_DOCUMENT", move_creators_affiliations_notes);

function move_creators_affiliations_notes(document)
{
	var type = document.querySelector('body').getAttribute('data-unit-type');
	if (type==='bookReview' || type==='mediaReview' || type==='editorial' || type==='letter' || type==='obituary')
	{	
		// select header notes referenced only from creator/@noteRef (below) and move them to fall after correspondenceTo/affiliationGroup/creators (further below)
		var movingNotes = document.createElement('ol');
		movingNotes.className = "notes";
		var notes = document.querySelectorAll('div[role="contentinfo"]>section.noteGroup>ol>li'); // all header notes
		var cRefs = document.querySelectorAll('section.creators li.creator span.link[data-note_label="yes"]:not([data-href])>a'); // all creators refs
		var oRefs = document.querySelectorAll('article header span.link[data-note_label="yes"][data-href]>a, article div[role="contentinfo"] span.link[data-note_label="yes"][data-href]>a'); // all other refs
		if (notes.length && cRefs.length)
		{
			for (var n=0; n<notes.length; n++) 
			{
				var data_type = notes[n].getAttribute('data-type');
				if (data_type==="authorRelated" || data_type==="equal") { // move notes of these types any way
					movingNotes.appendChild(notes[n]);
				}
				else
				{
					var noteId = "#" + notes[n].getAttribute('id');
					for (var r=0; r<cRefs.length; r++) 
					{
						if (noteId === cRefs[r].getAttribute('href')) // check creators refs
						{
							var amongOther = false;
							for (var o=0; o<oRefs.length; o++)
								if (noteId === oRefs[o].getAttribute('href')) {
									amongOther = true; // exclude other refs
									break;
								}
							
							if (amongOther == false) movingNotes.appendChild(notes[n]);
						}
					}
				}
			}
			
			// remove noteGroup if it's now empty
			var remainNotes = document.querySelectorAll('div[role="contentinfo"]>section.noteGroup>ol>li');
			if (!remainNotes.length) {		
				var noteGroup = document.querySelector('div[role="contentinfo"]>section.noteGroup');
				noteGroup.parentNode.removeChild(noteGroup);
			}
		}
		
		// If there is a <figure class="blockFixed" data-type="signatureBlock"> that occurs at the end of the article, hide authors/affiliations/correspondence
		if (document.querySelector('article>section:last-of-type figure.blockFixed[data-type="signatureBlock"]')) 
		{
			document.querySelector('section.creators').setAttribute('style','display:none;');
			if (document.querySelector('section.affiliationGroup')) {
				document.querySelector('section.affiliationGroup').setAttribute('style','display:none;');
			}
			if (document.querySelector('div.correspondenceTo')) {
				document.querySelector('div.correspondenceTo').setAttribute('style','display:none;');
			}
		}
		else
		{
			var fragment = document.createDocumentFragment();
			
			if (document.querySelector('section.keywordGroup')) {
				var keywordGroups = document.querySelectorAll('section.keywordGroup')
				for (i=0; i<keywordGroups.length; i++)
					fragment.appendChild(keywordGroups[i]);
			}
			
			fragment.appendChild(document.querySelector('section.creators'));
			if (!document.querySelector('section.affiliationGroup') && !document.querySelector('div.correspondenceTo') && movingNotes.querySelector('li')) {
				fragment.appendChild(movingNotes);
			}
			
			if (document.querySelector('section.affiliationGroup')) {
				fragment.appendChild(document.querySelector('section.affiliationGroup'));
				if (!document.querySelector('div.correspondenceTo') && movingNotes.querySelector('li')) {
					fragment.appendChild(movingNotes);
				}
			}
			if (document.querySelector('div.correspondenceTo')) {
				fragment.appendChild(document.querySelector('div.correspondenceTo'));
				if (movingNotes.querySelector('li')) {
					fragment.appendChild(movingNotes);
				}				
			}

			if (document.querySelector('section.letter>section.bibliography')) {
				document.querySelector('section.letter').insertBefore(fragment,document.querySelector('section.letter>section.bibliography'));
			}
			else if (document.querySelector('article.displayed-content>section.bibliography')) {
				document.querySelector('article.displayed-content').insertBefore(fragment,document.querySelector('article.displayed-content>section.bibliography'));
			}
			else if (document.querySelector('article.displayed-content>span.citation[data-type="self"]')) {
				document.querySelector('article.displayed-content').insertBefore(fragment,document.querySelector('article.displayed-content>span.citation[data-type="self"]'));
			}
			else
				document.querySelector('article.displayed-content').appendChild(fragment);
			
			// if <body>/@data-unit-type equals "editorial" then for a creator whose <span class="jobTitle"> contains the word "editor" we need to make this jobTitle visible
			if (type==='editorial')
			{
				var jobs = document.querySelectorAll('section.creators li.creator span.jobTitle')
				for (i=0; i<jobs.length; i++) 
					if (jobs[i].innerHTML.toLowerCase().indexOf('editor') >= 0)
						jobs[i].setAttribute('class','jobTitle editor');
			}
		}
		
		// wrap all authors and corresponding text within h1 citaions in <span class="authors-set">
		if (document.querySelectorAll('h1>.title>.RDFa>.citation').length)
		{
			var h1 = document.querySelector('h1');
			h1.setAttribute('formatting','yes');
			var citations = document.querySelectorAll('h1>.title>.RDFa>.citation');
			for (var c=0; c<citations.length; c++)
			{
				var citation = citations[c];
				var authors = document.createElement("span");
				authors.setAttribute('class','authors-set');
				var titlesPassed = false, 
					insertionPassed = false;
				var insertionPoint;
				for (var i=0; i<citation.childNodes.length; i++) {
					var curNode = citation.childNodes[i];
					if (curNode.nodeName === "#text") {
						if (curNode.nodeValue.match(/\S/) && titlesPassed && !insertionPassed) {
							authors.appendChild(curNode);
							i--;						
						}
					}
					else 
					{
						var curNodeClass = curNode.getAttribute("class")
						if (curNodeClass === 'bookTitle' || curNodeClass === 'bookSeriesTitle' || curNodeClass === 'articleTitle' || curNodeClass === 'journalTitle' || curNodeClass === 'chapterTitle' || curNodeClass === 'otherTitle' || curNodeClass === 'statuteTitle') {
							titlesPassed = true;
						}
						else if (curNodeClass === 'author' || curNodeClass === 'editor' || curNodeClass === 'groupName ') {
							authors.appendChild(curNode);
							i--;
						}
						else if (!insertionPassed) {
							insertionPoint = curNode;
							insertionPassed = true;
						}
					}
				}
				citation.insertBefore(authors, insertionPoint);
			}
		}
	}
}
