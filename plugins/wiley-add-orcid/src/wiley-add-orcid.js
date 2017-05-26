vivliostyle.plugin.registerHook("PREPROCESS_SINGLE_DOCUMENT", add_orcid_section);

function add_orcid_section(document)
{
                var orcids  = document.querySelectorAll('li.creator span[data-type="orcid"]');
                if (orcids.length)
                {
                               var section = document.createElement("section");
                               section.setAttribute('class','section');
                               section.innerHTML='<header class="titleGroup"><h2 class="title" data-type="main">ORCID</h2></header>';               
                              
                               for (i=0; i<orcids.length; i++)
                               {
                                               var url = orcids[i].getAttribute("data-value");
                                               var div = orcids[i].parentElement.parentElement;
                                               var name  = div.querySelector('span.personName span[property="schema:name"]').innerHTML;
                                               var p = document.createElement("p");
                                               p.innerHTML='<span class="orcidDetails"><span class="personName">' + name + '</span><img src="../../styles/orcid.gif" alt="orcid logo"/></span> <span class="url"><a class="urlAnchor" href="' + url + '" target="_blank">' + url + '</a></span>';            
                                               section.appendChild(p);
                               }
                              
                               // inserting the section
                               if (document.querySelector('article>section.bibliography')) {
                                               document.querySelector('article.displayed-content').insertBefore(section, document.querySelector('article>section.bibliography'));
                               }
                               else if (document.querySelector('article>span.citation[data-type="self"]')) {
                                               document.querySelector('article.displayed-content').insertBefore(section, document.querySelector('article>span.citation[data-type="self"]'));
                               }
                               else if (document.querySelector('article>section.appendix')) {
                                               document.querySelector('article.displayed-content').insertBefore(section, document.querySelector('article>section.appendix'));
                               }
                               else
                                               document.querySelector('article.displayed-content').appendChild(section);
                }
}
