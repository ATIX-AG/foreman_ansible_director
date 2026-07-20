import { useEffect, useState } from 'react';
// Jquery is available through Foreman's JS bundle
// @ts-ignore TS2307
import $ from 'jquery';

interface UseLegacySelectValueProps {
  selector: string;
  attributeName?: string;
}
interface UseLegacySelectValueReturn<T> {
  value: T | null;
}

/**
 * Custom hook to listen for changes on a jQuery element's value.
 *
 * @param selector - The jQuery selector string.
 * @param attributeName - The name of the attribute to query. The hook falls back to .val() if not given.
 */
export const useLegacySelectValue = <T,>({
  selector,
  attributeName,
}: UseLegacySelectValueProps): UseLegacySelectValueReturn<T> => {
  const [selectedDataId, setSelectedDataId] = useState<T | null>(null);

  useEffect(() => {
    const element = $(selector);

    const getValue = (): T | null => {
      let attributeValue;
      if (attributeName) {
        attributeValue = element.attr(attributeName);
      }
      const elementValue = element.val();

      // Inherited value, no override
      if (attributeValue && !elementValue) {
        return attributeValue;
      }
      // Value overridden in select
      else if (attributeValue !== elementValue) {
        return elementValue;
      }

      // Override exists, but it's the same value as the inherited one
      else if (attributeValue === elementValue) {
        return elementValue;
      }

      return null;
    };

    setSelectedDataId(getValue());

    const handleChange = (): void => {
      setSelectedDataId(getValue());
    };

    element.on('change', handleChange);

    return () => {
      element.off('change', handleChange);
    };
  }, [attributeName, selector]);

  return { value: selectedDataId };
};
