$(document).ready(function()
{
	stripy_tables();
});


function stripy_tables() 
{
	var tables = document.getElementsByTagName('table');
	
	for (var table = 0; table < tables.length; table++) 
	{
		var colnum = tables[table].getAttribute('data-tgroup_cols');
		var tbodys = tables[table].getElementsByTagName('tbody');
		
		for (var tbody = 0; tbody < tbodys.length; tbody++)
		{
			var rowspan = 0
			var tds = tbodys[tbody].getElementsByTagName('td');
			for (var td = 0; td < tds.length; td++)	
				if (tds[td].hasAttribute('rowspan')) {rowspan = 1; break;}
			
			if (rowspan == 1)
			{
				var rows = tbodys[tbody].getElementsByTagName('tr');
				var map = new Array(colnum);
		
				for (var row = 0; row < rows.length; row++)
				{
					var columns = rows[row].getElementsByTagName('td');
					var index = 0;
		
					if (row == 0)
					{
						for (var j = 0; j < colnum; j++)
						{
							var value = columns[index].hasAttribute('rowspan') ? columns[index].getAttribute('rowspan')-1 : 0;

							if (columns[index].hasAttribute('colspan'))
							{								
								for (var i = 0; i < columns[index].getAttribute('colspan'); i++) map[j+i] = value;
								j += columns[index].getAttribute('colspan')-1;	
							}
							else
								map[j] = value;

							if (columns[index].hasAttribute('rowspan')) columns[index].removeAttribute('rowspan');
							index++;							
						}
					}
					else
					{
						var newmap = new Array(colnum);
						
						for (var j = 0; j < colnum; j++)
						{
							if (map[j] != 0) 
								newmap[j] = map[j] - 1;
							else 
								if (columns[index].hasAttribute('colspan'))
								{
									for (var i = 0; i < columns[index].getAttribute('colspan'); i++)
										newmap[j+i] = (map[j+i] != 0) ? map[j+i] - 1 : (columns[index].hasAttribute('rowspan') ? columns[index].getAttribute('rowspan')-1 : 0);
									j += columns[index].getAttribute('colspan')-1;	
								}
								else 
									newmap[j] = (columns[index].hasAttribute('rowspan') ? columns[index].getAttribute('rowspan')-1 : 0);
								
							if (map[j] == 0) index++;
						}
	
						for (var j = 0; j < columns.length; j++)
							if (columns[j].hasAttribute('rowspan')) columns[j].removeAttribute('rowspan');
						
						var insert = "before";
						var columns_length = columns.length - 1;
						index = 0;
	
						for (var j = 0; j < colnum; j++)
						{
							var td = columns[index];
							var colspan = (td.hasAttribute('colspan')) ? td.getAttribute('colspan') : 0;
	
							if (map[j] != 0) 
							{
								var empty_td = document.createElement("TD");
								if (insert === "before")
								{
									rows[row].insertBefore(empty_td,td);
									index++;
								}
								else
									rows[row].appendChild(empty_td);							
							}
							else
							{
								if (colspan > 0) j += colspan - 1;
								if (index < columns_length) 
									index++;
								else
									insert = "after";
							}
						}
							
						map = newmap;
					}
					if ((row+1)%2 == 1 && !rows[row].hasAttribute('data-shaded')) rows[row].setAttribute('data-shaded','yes');
				}
			}
			else
			{
				var rows = tbodys[tbody].getElementsByTagName('tr');
	
				for (var row = 0; row < rows.length; row++)
					if ((row+1)%2 == 1 && !rows[row].hasAttribute('data-shaded')) rows[row].setAttribute('data-shaded','yes');
			}
		}
	}
}
