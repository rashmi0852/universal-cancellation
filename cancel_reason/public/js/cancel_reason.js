// Universal cancellation-reason prompt for ALL submittable doctypes.
$(document).on("app_ready", function () {
    const _orig = frappe.ui.form.Form.prototype.savecancel;
    frappe.ui.form.Form.prototype.savecancel = function (btn, callback, on_error) {
        const frm = this;
        if (!frm.doc || frm.doc.docstatus !== 1) {
            return _orig.call(frm, btn, callback, on_error);
        }
        const d = new frappe.ui.Dialog({
            title: __("Reason for Cancellation"),
            fields: [{
                fieldname: "reason", fieldtype: "Small Text",
                label: __("Reason"), reqd: 1,
                description: __("A reason is required to cancel this document."),
            }],
            primary_action_label: __("Yes, Cancel Document"),
            primary_action(values) {
                const reason = (values.reason || "").trim();
                if (!reason) { frappe.msgprint(__("Reason cannot be blank.")); return; }
                d.hide();
                frappe.call({
                    method: "cancel_reason.api.add_cancellation_reason",
                    args: { doctype: frm.doctype, docname: frm.docname, reason: reason },
                    freeze: true, freeze_message: __("Recording reason..."),
                    callback() { _orig.call(frm, btn, callback, on_error); },
                });
            },
            secondary_action_label: __("No"),
            secondary_action() { d.hide(); },
        });
        d.show();
    };
});
