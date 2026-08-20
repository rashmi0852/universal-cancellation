import frappe
from frappe import _

_PREFIX = "cancel_reason::"

@frappe.whitelist()
def add_cancellation_reason(doctype, docname, reason):
    reason = (reason or "").strip()
    if not reason:
        frappe.throw(_("Reason cannot be blank."))
    doc = frappe.get_doc(doctype, docname)
    doc.add_comment("Comment", _("Cancellation reason: {0}").format(reason))
    frappe.cache().set_value(_PREFIX + f"{doctype}:{docname}", reason, expires_in_sec=300)
    return {"ok": True}

def enforce_cancellation_reason(doc, method=None):
    key = _PREFIX + f"{doc.doctype}:{doc.name}"
    reason = frappe.cache().get_value(key)
    if not reason:
        frappe.throw(_("A cancellation reason is required."))
    frappe.cache().delete_value(key)
