vivliostyle.plugin.registerHook("PREPROCESS_SINGLE_DOCUMENT", postprocess);

function postprocess(document)
{
	var affiliations = document.querySelectorAll('span.affiliationRef');
	for (var i=0; i<affiliations.length; i++)
	{
		var str = affiliations[i].innerHTML;
		affiliations[i].innerHTML = str.replace(/,$/,"");
	}
}
