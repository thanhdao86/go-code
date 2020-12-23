const getOfferTransactionId = async (sendoId, loan) => {
    const { offer_id } = loan;
    let fe_transaction_id = offer_id;

    if (!fe_transaction_id) {
        // trường hợp thao tác mới
        fe_transaction_id = uuidv4();
        // get old transaction
        const dataTransactionOld = await getLoanTransactionByUserID(sendoId);
        if (dataTransactionOld.length) {
            const filter = dataTransactionOld
                .filter((e) => e.offer_status !== OFFER_STATUS.REJECTED && e.offer_status !== OFFER_STATUS.ERROR)
                .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
            if (filter.length) {
                const lastItemTransaction = filter[0];
                console.log("lastItemTransaction", lastItemTransaction);
                const dataLoan = (await getLoan(sendoId, lastItemTransaction.transaction_id)).Item;
                if (!dataLoan) {
                    if (lastItemTransaction.offer_status === OFFER_STATUS.SUCCESS &&  moment().diff(lastItemTransaction.created_date, "days") <= 15) {
                        const responseOfferSuccess = {
                            status: "SUCCESS",
                            error_message: "",
                            loan: {
                                offer_id: lastItemTransaction.transaction_id,
                            },
                        };
                        return { responseOfferSuccess };
                    } else if (lastItemTransaction.offer_status === OFFER_STATUS.PROCESSING &&  moment().diff(lastItemTransaction.created_date, "minutes") <= 30) {
                        // transaction chưa có khoảng vay và trạng thái processing không được quá 30 phút
                        const responseOfferSuccess = {
                            status: "SUCCESS",
                            error_message: "",
                            loan: {
                                offer_id: lastItemTransaction.transaction_id,
                            },
                        };
                        return { responseOfferSuccess };
                    }

                }
            }
        }
    }
    return { fe_transaction_id };
};
