import { Component } from './core.js';
import "./pluggins/datatables.min.js";

export class TableComponent extends Component
{
	constructor(tableSelector) {
		super();
		this.scrollY = '50vh';

		if (tableSelector === undefined || tableSelector === null) {
			tableSelector = 'table';
		}

		this.tableSelector = tableSelector;
		this.options = {};
		this.columns = [];
	}

	limitChars(text, max) {
		if (text.length > max) {
			return text.substr(0, max - 3) + '...';
		}
		return text;
	}

	setOption(key, value) {
		this.options[key] = value;
	}

	getOption(key) {
		return this.options[key];
	}
	
	create(options) {
		let id = options.id ?? null;
		let header = options.header ?? null;
		let data = options.data ?? null;
		let fields = options.fields ?? null;
		let footer = options.footer ?? null;
		let classes = options.classes ?? null;
		let tr_classes = options.tr_classes ?? null;
		let td_classes = options.td_classes ?? null;
		let columns = options.columns ?? null;
		let tr = options.tr ?? null;
		let td = options.td ?? null;
		
		if (header === null || header === undefined) {
			header = [];
		}
		if (data === null || data === undefined) {
			data = [];
		}
		if (fields === null || fields === undefined) {
			fields = {};
		}
		if (footer === null || footer === undefined) {
			footer = [];
		}
		if (classes === null || classes === undefined) {
			classes = 'table table-sm table-responsive d-block d-md-table table-striped';
		}
		if (columns === null || columns === undefined) {
			columns = header.map(i => {
				return {
					width: "auto",
					visible: true
				};
			});
		} else {
			columns = columns.map(c => {
				return {
					width: c.width ?? "auto",
					visible: c.visible ?? true
				};
			});
		}
		if (tr_classes === null || tr_classes === undefined) {
			tr_classes = '';
		}
		if (td_classes === null || td_classes === undefined) {
			td_classes = '';
		}
		if (tr === null || tr === undefined) {
			tr = r => '';
		}
		if (td === null || td === undefined) {
			td = (f, v) => '';
		}

		const format = fields;
		fields = [];

		for (let key in format) {
			fields.push(key);
		}
		
		this.columns = columns;

		return `
			<table id="${id}" class="${classes}">
				<thead class="thead">
					<tr class="">
						${
							header.map(
								(th, key) => `<th style="width: ${columns[key].width}">${th}</th>`
							).join('')
						}
					</tr>
				</thead>
				
				<tbody class="tbody">
					${
						data.map(
							(row, index) => `
								<tr class="${tr_classes}" ${tr(row, index)}>
									${
										fields.map(
											(field, key) => `
												<td style="width: ${columns[key].width}" class="${td_classes}" ${td(field, key, row[field])}>
													${
														(field in format)
															? format[field](row[field])
															: row[field]
													}
												</td>
											`
										).join('')
									}
								</tr>
							`
						).join('')
					}
				</tbody>
				
				<tfoot class="tfoot">
					<tr class="">
						${
							footer.map(
								(td, key) => `<td style="width: ${columns[key].width}">${td}</td>`
							).join('')
						}
					</tr>
				</tfooter>
			</table>
		`;
	}

	reload() {
		super.reload();

		const options = {
			"paging": true,
			"ordering": true,
			"info": true,
			"scrollY": this.scrollY,
			"scrollCollapse": true,
			"fnDrawCallback": oSettings => {
				$(oSettings.nTableWrapper).find('.pagination li:not(.active) *').addClass('text-info');
				$(oSettings.nTableWrapper).find('.pagination li.active *').addClass('bg-info');
				if (oSettings._iDisplayLength >= oSettings.fnRecordsDisplay()) {
					$(oSettings.nTableWrapper).find('.dataTables_paginate').hide();
				} else {
					$(oSettings.nTableWrapper).find('.dataTables_paginate').show();
				}
			},
			"fnInitComplete": () => {
				$(this.tableSelector).show();
			}
		};

		for (const key in this.options) {
			options[key] = this.options[key];
		}

		$(() => {
			let table = null;
			$(this.tableSelector).hide();
			
			if ($.fn.dataTable.isDataTable(this.tableSelector)) {
				table = $(this.tableSelector).DataTable();
			} else {
				table = $(this.tableSelector).DataTable(options);
			}

			for (let index in this.columns) {
				table.column(index).visible(this.columns[index].visible);
			}
			
			$('a[data-toggle="tab"]').on('shown.bs.tab', function(e){
			   $($.fn.dataTable.tables(true)).DataTable().columns.adjust();
			});
			$('table').css("visibility", "visible");
		});
	}
}

export class ModalComponent extends Component
{
	constructor(contentClass) {
		super();
		this.disable();
		this.onOpen = this.onClose = () => null;
		this.content = new contentClass(this);
	}

	onFirst() {
		this.appendChild(
			this.content,
			`${this.selector} .modal .modal-content`
		);
	}

	setOnOpen(callback) {
		this.onOpen = callback;
	}

	setOnClose(callback) {
		this.onClose = callback;
	}

	register(name, callback) {
		this[name] = callback;
	}

	open() {
		const options = {
			backdrop: 'static',
			keyboard: false,
			focus: true
		};
		this.enable();
		const modalSelect = $(`${this.selector} .modal`);
		modalSelect.modal(options);
		modalSelect.on('shown.bs.modal', () => this.onOpen());
	}

	close() {
		const modalSelect = $(`${this.selector} .modal`);
		modalSelect.modal('hide');
		modalSelect.on('hidden.bs.modal', () => {
			this.disable();
			this.onClose();
		});
	}

	render() {
		return `
			<div class="modal fade custom-size" .modal" tabindex="-1" role="dialog" aria-hidden="true">
				<div class="modal-dialog ${this.dataset.classes || ''}" role="document">
					<div class="modal-content"></div>
				</div>
			</div>
		`;
	}
}