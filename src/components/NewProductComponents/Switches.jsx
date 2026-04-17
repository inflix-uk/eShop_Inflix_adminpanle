
export default function Switches({ authentic, setAuthentic, featured, setFeatured, refundable, setRefundable, warranty, setWarranty, replacementWarranty, setReplacementWarranty, warrantyDuration, setWarrantyDuration, warrantyType, setWarrantyType, refundDuration, setrefundDuration, refundType, setrefundType, perksAndBenefits, setPerksAndBenefits }) {
   
    return (
        <>
            <div className="sm:px-0  px-10 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                <div className="py-4 px-4 divide-y-2">
                    {/* Featured */}
                    <div className=" flex flex-row items-center justify-between py-2">
                        <label
                            htmlFor="featured"
                            className="block text-sm font-medium leading-6 text-gray-900"
                        >
                            Featured
                        </label>
                        <label className=" items-center cursor-pointer ">
                            <input
                                id="featured"
                                name="featured"
                                type="checkbox"
                                checked={featured}
                                onChange={() => {
                                    setFeatured(!featured);
                                }}
                                className="sr-only peer "
                            />
                            <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
                        </label>
                    </div>

                    {/* Authentic */}
                    <div className=" flex flex-row items-center justify-between py-2">
                        <label
                            htmlFor="authentic"
                            className="block text-sm font-medium leading-6 text-gray-900"
                        >
                            Verified Refurbished
                        </label>
                        <label className=" items-center cursor-pointer ">
                            <input
                                id="authentic"
                                name="authentic"
                                type="checkbox"
                                checked={authentic}
                                onChange={() => {
                                    setAuthentic(!authentic);
                                }}
                                className="sr-only peer "
                            />
                            <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
                        </label>
                    </div>

                    {/* Refundable */}
                    <div className="flex flex-col">
                        <div className=" flex flex-row items-center justify-between py-2">
                            <label
                                htmlFor="refundable"
                                className="block text-sm font-medium leading-6 text-gray-900"
                            >
                                Refundable
                            </label>
                            <label className=" items-center cursor-pointer ">
                                <input
                                    id="refundable"
                                    name="refundable"
                                    type="checkbox"
                                    checked={refundable}
                                    onChange={() => {
                                        setRefundable(!refundable);
                                        setrefundDuration("");
                                        setrefundType("Day");
                                    }}
                                    className="sr-only peer"
                                />
                                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
                            </label>
                        </div>
                        {refundable && (
                            <div className="mb-3">
                                <div className="flex flex-col md:flex-row items-center gap-2">
                                    <input
                                        type="number"
                                        className="block w-full rounded-md border-0 py-1.5  text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                        placeholder="0"
                                        value={refundDuration}
                                        onChange={(e) =>
                                            setrefundDuration(e.target.value)
                                        }
                                    />
                                    <select
                                        autoComplete="country-name"
                                        className="block w-full rounded-md border-0 py-1.5  text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                        defaultValue={"Days"}
                                        value={refundType}
                                        onChange={(e) => setrefundType(e.target.value)}
                                    >
                                        <option value={"Day"}>Day</option>
                                        <option value={"Month"}>Month</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Warranty */}
                    <div className="flex flex-col">
                        <div className=" flex flex-row items-center justify-between py-2">
                            <label
                                htmlFor="warranty"
                                className="block text-sm font-medium leading-6 text-gray-900"
                            >
                                Warranty
                            </label>
                            <label className=" items-center cursor-pointer ">
                                <input
                                    id="warranty"
                                    name="warranty"
                                    type="checkbox"
                                    checked={warranty}
                                    onChange={() => {
                                        setWarranty(!warranty);
                                        setReplacementWarranty(false);
                                        setWarrantyDuration("");
                                        setWarrantyType("Day");
                                    }}
                                    className="sr-only peer "
                                />
                                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
                            </label>
                        </div>
                        {warranty && (
                            <>
                                <div className=" flex flex-row items-center justify-between py-2">
                                    <label
                                        htmlFor="replacementWarranty"
                                        className="block text-sm font-medium leading-6 text-gray-900"
                                    >
                                        Replacement Warranty
                                    </label>
                                    <label className=" items-center cursor-pointer ">
                                        <input
                                            id="replacementWarranty"
                                            name="replacementWarranty"
                                            type="checkbox"
                                            checked={replacementWarranty}
                                            onChange={() => {
                                                setReplacementWarranty(!replacementWarranty);
                                            }}
                                            className="sr-only peer "
                                        />
                                        <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
                                    </label>
                                </div>
                                <div className="flex flex-col md:flex-row items-center gap-2">
                                    <input
                                        type="number"
                                        name="discount"
                                        id="discount"
                                        className="block w-full rounded-md border-0 py-1.5  text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                        placeholder="0"
                                        value={warrantyDuration}
                                        onChange={(e) =>
                                            setWarrantyDuration(e.target.value)
                                        }
                                    />
                                    <select
                                        id="discount"
                                        name="discount"
                                        autoComplete="country-name"
                                        className="block w-full rounded-md border-0 py-1.5  text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                        defaultValue={"Days"}
                                        value={warrantyType}
                                        onChange={(e) => setWarrantyType(e.target.value)}
                                    >
                                        <option value={"Day"}>Day</option>
                                        <option value={"Month"}>Month</option>
                                    </select>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Perks and Benefits */}
                    <div className=" flex flex-row items-center justify-between py-2">
                        <label
                            htmlFor="perksAndBenefits"
                            className="block text-sm font-medium leading-6 text-gray-900"
                        >
                            Perks and Benefits
                        </label>
                        <label className=" items-center cursor-pointer ">
                            <input
                                id="perksAndBenefits"
                                name="perksAndBenefits"
                                type="checkbox"
                                checked={perksAndBenefits}
                                onChange={() => {
                                    setPerksAndBenefits(!perksAndBenefits);
                                }}
                                className="sr-only peer "
                            />
                            <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
                        </label>
                    </div>
                </div>
            </div>
        </>
    )
}
 